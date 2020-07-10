const jailed = require("jailed")
const mdit = require("markdown-it")()

/**
 * Gets HTML form of a variable.
 *
 * @param {string} name - Name of the variable.
 * @param {"shorttext"|"text"|"rawOut"|"mdOut"|"checkbox"|"options"} type - Type of the variable.
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
		case "rawOut":
			return `<div id="script${name}">${data}</div>`
		case "mdOut":
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
		.map((e) => e.replace(/[^a-zA-z0-9:]/gi, "")) // Removes non-alphanumerical characters, except colons.
	for (let e of vars) {
		let [type, name, data] = e.split(":")
		if (output.includes(name)) throw new Error("Names must be unique")
		let html = var2html([name, type, data])
		output[name] = [type, data, html, "script" + name]
	}
	return output
}

/**
 * @class - Represents a Script, contains the text, the jailed instance, the html elements, and logic.
 */
class Script {
	render() {
		let html = mdit.render(this.md)
		for (let e of Object.values(this.vars)) {
			html = html.replace(/\{\{.*?\}\}/, e[2]) // e[2] is the variable html.
		}
		this.element.innerHTML = html
	}
	constructor(id = "script", code = "", bindings = {}) {
		this.id = id
		this.element = document.getElementById(id)
		;[this.md, this.code] = code.split("{{{{")
		this.code += "application.setInterface({step:step})"
		this.vars = getVariables(this.md) // Elements between brackets.
		this.plugin = new jailed.DynamicPlugin(code, bindings)
		this.started = false
	}
	start() {
		return new Promise((resolve) => {
			this.plugin.whenConnected(() => {
				this.started = true
				resolve()
			})
		})
	}
}

window.qqq = {Script: Script}
