// NOTE: jailed was already imported
const mdit = require("markdown-it")()

/**
 * Gets HTML form of a variable.
 *
 * @param {string} name - Name of the variable.
 * @param {"run"|"shorttext"|"text"|"outraw"|"outraw"|"checkbox"|"options"} type - Type of the variable.
 * @param {string} data - Data associated with the variable.
 * @returns {string} - HTML form of the variable.
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
			return `<input type="checkbox" id="script${name}">`
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
 * Extracts variables marked with "{{ type:name:data }}" notation.
 *
 * @param {string} md - Markdown text.
 * @returns {Object} - Variables in {"name":["type", "data", "HTML", "id"], ...} notation.
 *
 * @example
 * In: "Sample {{text:cool}} Text {{ input:val$ue }}"
 * Out: {"cool":["text", "", "<textarea id="scriptcool"></textarea>", "scriptcool"], "val$ue":...}
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
 * 
 * @param {*} output - Values to be displayed. Non-arrays are turned to single item arrays.
 * @param {object} vars - Variables in {name:[type, data, html, id]} format.
 */
function setOutput(output, vars) {
	if (!Array.isArray(output)) output = [output] // All outputs are in array format.
	for (let [type, , , id] of Object.values(vars)) {
		if (type.slice(0, 3) == "out") {
			// If the variable is an output
			switch (type) {
				case "outraw":
					document.getElementById(id).innerHTML = String(
						output.shift()
					)
					break
				case "outmd":
					document.getElementById(id).innerHTML = mdit.render(
						String(output.shift())
					)
					break
				default:
					break
			}
		}
	}
}

/**
 * @class - Represents a Script, contains the text, the jailed instance, the html elements, and logic.
 */
class Script {
	async render() {
		let html = mdit.render(this.md)
		for (let [, , htm] of Object.values(this.vars)) {
			html = html.replace(/\{\{.*?\}\}/, htm) // html is the render, htm is the variable's html.
		}
		this.element.innerHTML = html
		for (let [type, , , id] of Object.values(this.vars)) {
			if (type == "run")
				document.getElementById(id).addEventListener("click", () => {
					this.run()
				})
		}
	}
	/**
	 * @param {string} id - Id of the div to be modified. 
	 * @param {string} code - Script to be loaded
	 * @param {object} bindings - jailed bindings for the code.
	 */
	constructor(id = "script", code = "", bindings = {}) {
		this.id = id
		this.element = document.getElementById(id)
		;[this.md, this.code] = code.split("{{{{")
		this.code += ";application.setInterface({run:run})"
		this.vars = getVariables(this.md) // Elements between brackets.
		bindings["ret"] = (...val) => {
			this.ret = val
		}
		this.plugin = new jailed.DynamicPlugin(this.code, bindings)
		this.loading = true
		this.render()
	}
	start() {
		return new Promise((resolve) => {
			this.plugin.whenConnected(() => {
				this.loading = false
				resolve()
			})
		})
	}
	async run() {
		if (this.loading) await this.start()
		let args = getArguments(this.vars)
		await new Promise((resolve) => {
			this.plugin.remote.run(args, (val) => {
				this.ret = val
				resolve()
			})
		})
		setOutput(this.ret, this.vars)
	}
}

window.mds = {Script: Script}
