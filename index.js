/**
 * @module mds
 */

// NOTE: jailed was already imported
const mdit = require("markdown-it")()

/**
 * Gets HTML form of a variable.
 * @private
 *
 * @param {string} name - Name of the variable.
 * @param {"run"|"shorttext"|"text"|"outraw"|"outraw"|"checkbox"|"options"} type - Type of the variable.
 * @param {string} data - Data associated with the variable.
 * @returns {string} HTML form of the variable.
 *
 * @example
 * In: ["name", "text"]
 * Out: "<textarea id="scriptname"></textarea>"
 */
function var2html(name, type, data) {
	data = data || ""
	switch (type) {
		case "run":
			return `<button id="script${name}">${data}</button>`
		case "shorttext":
			return `<input type="text" id="script${name}", value="${data}">`
		case "text":
			return `<textarea id="script${name}">${data}</textarea>`
		case "outraw":
			return `<div id="script${name}">${data}</div>`
		case "outmd":
			return `<div id="script${name}">${data}</div>`
		case "checkbox":
			let checked = ""
			if (Number(data)) checked = " checked"
			return `<input type="checkbox" id="script${name}"${checked}>`
		case "options":
			let html = `<select id="script${name}">`
			if (data)
				for (let option of data.split(","))
					html += `<option value="${option}">${option}</option>`
			return html + "</select>"
		default:
			return ""
	}
}

/**
 * Extracts variables marked with "{{type:name:data}}" notation.
 * @private
 *
 * @param {string} md - Markdown text.
 * @returns {object} Variables in {"name":["type", "data", "HTML", "id"], ...} notation.
 *
 * @example
 * In: "Sample {{text:cool}} Text {{ input:val$ue }}"
 * Out: {"cool":["text", "", "<textarea id="scriptcool"></textarea>", "scriptcool"], "val$ue ":...}
 */
function getVariables(md) {
	let output = {}
	let vars = md
		.match(/\{\{.*?\}\}/gi) // Selects elements between brackets.
		.map((e) => e.replace(/[{}]/gi, "")) // Removes brackets
	for (let e of vars) {
		let [type, name, data] = e.split(":")
		if (name in output) throw new Error("Names must be unique")
		let html = var2html(name, type, data)
		output[name] = [type, data || "", html, "script" + name]
	}
	return output
}

/**
 * Gets the value of the arguments for the function.
 * @private
 *
 * @param {object} vars - Variables in {"name":["type", "data", "HTML", "id"], ...} notation.
 * @returns {object} Arguments in {"name": value} notation.
 */
function getArguments(vars) {
	var args = {}
	for (let [name, [type, , , id]] of Object.entries(vars)) {
		switch (type) {
			case "text":
			case "shorttext":
			case "options":
				args[name] = document.getElementById(id).value
				break
			case "checkbox":
				args[name] = document.getElementById(id).checked
				break
			default:
				break
		}
	}
	return args
}

/**
 * Sets the output to the respective variables inside the document.
 * @private
 *
 * @param {object|*} output - Values displayed in {"name":value} format. If not an object, {"output":output} is used.
 * @param {object} vars - Variables in {"name":["type", "data", "html", "id"]} format.
 * @param {boolean} outraw - Allow `outraw` (plain HTML) output.
 */
function setOutput(output, vars, outraw) {
	if (Array.isArray(output) || typeof output != "object")
		output = {output: output} //Turns into dictionary if not already.
	for (let [name, value] of Object.entries(output)) {
		let [type, , , id] = vars[name]
		switch (type) {
			case "outraw":
				if (outraw)
					document.getElementById(id).innerHTML = String(value)
				break
			case "outmd":
				document.getElementById(id).innerHTML = mdit.render(
					String(value)
				)
				break
			case "text":
			case "shorttext":
			case "options":
				document.getElementById(id).value = String(value)
				break
			case "checkbox":
				document.getElementById(id).checked = value
				break
			default:
				break
		}
	}
}

/**
 * Renders markdown-it in a div.
 * @private
 *
 * @param {string} id - Id of div.
 * @param {string} md - Markdown code.
 */
async function renderMD(id, md) {
	let ready = ["interactive", "compete"].includes(document.readyState)
	if (!ready)
		await new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => {
				resolve()
			})
		})
	let html = mdit.render(md)
	document.getElementById(id).innerHTML = html
}

/**
 * Injects javascript to expose the used functions outside the jailed plugin.
 * @private
 *
 * @param {object} vars - Variables in {"name":["type", "data", "html", "id"]} format.
 *
 * @returns {string} Code to be injected. Looks like ";application.setInterface({exec:exec})",
 * if "exec" is the only `run` type variable.
 */
function exposeFunctions(vars) {
	let code = ";application.setInterface({"
	for (let [name, [type, , ,]] of Object.entries(vars))
		if (type == "run") code += `${name}:${name},`
	return code.slice(0, -1) + "})" // The last comma is eliminated with `slice`.
}

/**
 * @class - Represents a Script, contains the text, the jailed instance, the html elements, and logic.
 */
class Script {
	/**
	 * Creates the script, and runs the initial render.
	 *
	 * @param {string} id - Id of the div to be modified.
	 * @param {string} code - Script to be loaded.
	 * @param {object} [options] - Option object.
	 * @param {object} [options.bindings={}] - Jailed bindings for the code.
	 * @param {boolean} [options.outraw=false] - Allow `outraw` (raw HTML) output.
	 */
	constructor(id = "", code = "", {outraw = false, bindings = {}} = {}) {
		if (!code.includes("{{{{")) {
			// If there is no script, just javascript.
			renderMD(id, code)
			return
		}
		this.outraw = outraw
		this.id = id
		;[this.md, this.code] = code.split("{{{{")
		this.vars = getVariables(this.md) // Elements between brackets.
		this.code += exposeFunctions(this.vars)
		this.plugin = new jailed.DynamicPlugin(this.code, bindings)
		this.loading = true
		this.render()
	}

	/**
	 * Displays the script in the given id.
	 */
	async render() {
		let ready = ["interactive", "compete"].includes(document.readyState)
		if (!ready)
			await new Promise((resolve) => {
				document.addEventListener("DOMContentLoaded", () => {
					resolve()
				})
			})
		let html = mdit.render(this.md)
		for (let [, , htm] of Object.values(this.vars)) {
			html = html.replace(/\{\{.*?\}\}/, htm) // html is the render, htm is the variable's html.
		}
		document.getElementById(this.id).innerHTML = html
		for (let [name, [type, , , id]] of Object.entries(this.vars)) {
			if (type == "run")
				document.getElementById(id).addEventListener("click", () => {
					this.run(name)
				})
		}
	}

	/**
	 * Executes the code in the jailed plugin and displays the result.
	 *
	 * @param {string} fn - Function to run.
	 */
	async run(fn) {
		if (this.loading)
			// Waits for Jailed plugin to load.
			await new Promise((resolve) => {
				this.plugin.whenConnected(() => {
					this.loading = false
					resolve()
				})
			})

		let args = getArguments(this.vars)
		await new Promise((resolve) => {
			this.plugin.remote[fn](args, (val) => {
				this.ret = val
				resolve()
			})
		})
		setOutput(this.ret, this.vars, this.outraw)
	}
}

window.mds = {Script: Script}
