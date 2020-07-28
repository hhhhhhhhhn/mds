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
 * Executes the code in the jailed plugin and displays the result.
 * @private
 *
 * @param {string} fn - Function to run.
 * @param {object} vars - Variables in {"name":["type", "data", "html", "id"]} format.
 * @param {jailed.DynamicPlugin} plugin - jailed plugin.
 */
async function run(fn, vars, plugin, outraw) {
	const args = getArguments(vars)
	let ret
	await new Promise((resolve) => {
		plugin.remote[fn](args, (val) => {
			ret = val
			resolve()
		})
	})
	setOutput(ret, vars, outraw)
}

/**
 * Creates and renders the script.
 *
 * @param {string} id - Id of the div to be modified.
 * @param {string} code - Script to be loaded.
 * @param {object} [options] - Option object.
 * @param {object} [options.bindings={}] - Jailed bindings for the code.
 * @param {boolean} [options.outraw=false] - Allow `outraw` (raw HTML) output.
 */
async function create(
	id = "",
	code = "",
	{outraw = false, bindings = {}} = {}
) {
	if (!code.includes("{{{{")) {
		// If plain markdown is given, just renders it.
		document.getElementById(id).innerHTML = mdit.render(md)
		return
	}

	let [md, js] = code.split("{{{{")
	let vars = getVariables(md) // Elements between brackets.
	js += exposeFunctions(vars) // Injects code that exposes variables.

	let plugin = new jailed.DynamicPlugin(js, bindings)
	await new Promise((resolve) => {
		// Waits for jailed plugin initialization.
		plugin.whenConnected(() => {
			resolve()
		})
	})

	let htmlOutput = mdit.render(md)
	for (let [, , html] of Object.values(vars)) {
		htmlOutput = htmlOutput.replace(/\{\{.*?\}\}/, html)
	}
	document.getElementById(id).innerHTML = htmlOutput

	for (let [name, [type, , , id]] of Object.entries(vars)) {
		if (type == "run")
			document.getElementById(id).addEventListener("click", () => {
				run(name, vars, plugin, outraw)
			})
	}
}

window.mds = {create: create}
