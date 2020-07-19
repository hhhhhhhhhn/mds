<a name="module_mds"></a>

## mds

* [mds](#module_mds)
    * [~Script](#module_mds..Script)
        * [new Script(id, code, bindings, options)](#new_module_mds..Script_new)
        * [.render()](#module_mds..Script+render)
        * [.start()](#module_mds..Script+start) ℗
        * [.run(fn)](#module_mds..Script+run)
    * [~var2html(name, type, data)](#module_mds..var2html) ⇒ <code>string</code> ℗
    * [~getVariables(md)](#module_mds..getVariables) ⇒ <code>object</code> ℗
    * [~getArguments(vars)](#module_mds..getArguments) ⇒ <code>object</code> ℗
    * [~setOutput(output, vars, outraw)](#module_mds..setOutput) ℗
    * [~renderMD(id, md)](#module_mds..renderMD)
    * [~exposeFunctions(vars)](#module_mds..exposeFunctions) ⇒ <code>string</code> ℗

<a name="module_mds..Script"></a>

### mds~Script
- Represents a Script, contains the text, the jailed instance, the html elements, and logic.

**Kind**: inner class of [<code>mds</code>](#module_mds)  

* [~Script](#module_mds..Script)
    * [new Script(id, code, bindings, options)](#new_module_mds..Script_new)
    * [.render()](#module_mds..Script+render)
    * [.start()](#module_mds..Script+start) ℗
    * [.run(fn)](#module_mds..Script+run)

<a name="new_module_mds..Script_new"></a>

#### new Script(id, code, bindings, options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | <code>&quot;script&quot;</code> | Id of the div to be modified. |
| code | <code>string</code> |  | Script to be loaded. |
| bindings | <code>object</code> |  | Jailed bindings for the code. |
| options | <code>object</code> |  | Option object. |
| options.outraw | <code>boolean</code> |  | Allow `outraw` (raw HTML) output. |

<a name="module_mds..Script+render"></a>

#### script.render()
Displays the script in the given id.

**Kind**: instance method of [<code>Script</code>](#module_mds..Script)  
<a name="module_mds..Script+start"></a>

#### script.start() ℗
Helper function which starts the jailed plugin as a Promise.

**Kind**: instance method of [<code>Script</code>](#module_mds..Script)  
**Access**: private  
<a name="module_mds..Script+run"></a>

#### script.run(fn)
Executes the code in the jailed plugin and returns

**Kind**: instance method of [<code>Script</code>](#module_mds..Script)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>string</code> | Function to run. |

<a name="module_mds..var2html"></a>

### mds~var2html(name, type, data) ⇒ <code>string</code> ℗
Gets HTML form of a variable.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Returns**: <code>string</code> - HTML form of the variable.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the variable. |
| type | <code>&quot;run&quot;</code> \| <code>&quot;shorttext&quot;</code> \| <code>&quot;text&quot;</code> \| <code>&quot;outraw&quot;</code> \| <code>&quot;outraw&quot;</code> \| <code>&quot;checkbox&quot;</code> \| <code>&quot;options&quot;</code> | Type of the variable. |
| data | <code>string</code> | Data associated with the variable. |

**Example**  
```js
In: ["name", "text"]Out: "<textarea id="scriptname"></textarea>"
```
<a name="module_mds..getVariables"></a>

### mds~getVariables(md) ⇒ <code>object</code> ℗
Extracts variables marked with "{{type:name:data}}" notation.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Returns**: <code>object</code> - Variables in {"name":["type", "data", "HTML", "id"], ...} notation.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| md | <code>string</code> | Markdown text. |

**Example**  
```js
In: "Sample {{text:cool}} Text {{ input:val$ue }}"Out: {"cool":["text", "", "<textarea id="scriptcool"></textarea>", "scriptcool"], "val$ue ":...}
```
<a name="module_mds..getArguments"></a>

### mds~getArguments(vars) ⇒ <code>object</code> ℗
Gets the value of the arguments for the function.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Returns**: <code>object</code> - Arguments in {"name": value} notation.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| vars | <code>object</code> | Variables in {"name":["type", "data", "HTML", "id"], ...} notation. |

<a name="module_mds..setOutput"></a>

### mds~setOutput(output, vars, outraw) ℗
Sets the output to the respective variables inside the document.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| output | <code>object</code> \| <code>\*</code> | Values displayed in {"name":value} format. If not an object, {"output":output} is used. |
| vars | <code>object</code> | Variables in {"name":["type", "data", "html", "id"]} format. |
| outraw | <code>boolean</code> | Allow `outraw` (plain HTML) output. |

<a name="module_mds..renderMD"></a>

### mds~renderMD(id, md)
Renders markdown-it in a div.

**Kind**: inner method of [<code>mds</code>](#module_mds)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of div. |
| md | <code>string</code> | Markdown code. |

<a name="module_mds..exposeFunctions"></a>

### mds~exposeFunctions(vars) ⇒ <code>string</code> ℗
Injects javascript to expose the used functions outside the jailed plugin.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Returns**: <code>string</code> - Code to be injected. Looks like ";application.setInterface({exec:exec})",if "exec" is the only `run` type variable.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| vars | <code>object</code> | Variables in {"name":["type", "data", "html", "id"]} format. |

