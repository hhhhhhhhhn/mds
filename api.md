<a name="module_mds"></a>

## mds

* [mds](#module_mds)
    * [~Script](#module_mds..Script)
        * [new Script(id, code, bindings, options)](#new_module_mds..Script_new)
        * [.render()](#module_mds..Script+render)
        * [.run(fn)](#module_mds..Script+run)
    * [~renderMD(id, md)](#module_mds..renderMD)

<a name="module_mds..Script"></a>

### mds~Script
- Represents a Script, contains the text, the jailed instance, the html elements, and logic.

**Kind**: inner class of [<code>mds</code>](#module_mds)  

* [~Script](#module_mds..Script)
    * [new Script(id, code, bindings, options)](#new_module_mds..Script_new)
    * [.render()](#module_mds..Script+render)
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
<a name="module_mds..Script+run"></a>

#### script.run(fn)
Executes the code in the jailed plugin and returns

**Kind**: instance method of [<code>Script</code>](#module_mds..Script)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>string</code> | Function to run. |

<a name="module_mds..renderMD"></a>

### mds~renderMD(id, md)
Renders markdown-it in a div.

**Kind**: inner method of [<code>mds</code>](#module_mds)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of div. |
| md | <code>string</code> | Markdown code. |

