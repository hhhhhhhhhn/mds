<a name="module_mds"></a>

## mds

* [mds](#module_mds)
    * [~readFile(id)](#module_mds..readFile) ⇒ <code>string</code>
    * [~create(id, code, [options])](#module_mds..create)

<a name="module_mds..readFile"></a>

### mds~readFile(id) ⇒ <code>string</code>
Gets the content from file input, or returns empty string.

**Kind**: inner method of [<code>mds</code>](#module_mds)  
**Returns**: <code>string</code> - - File contents or empty string.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the input element. |

<a name="module_mds..create"></a>

### mds~create(id, code, [options])
Creates and renders the script.

**Kind**: inner method of [<code>mds</code>](#module_mds)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | Id of the div to be modified. |
| code | <code>string</code> |  | Script to be loaded. |
| [options] | <code>object</code> |  | Option object. |
| [options.bindings] | <code>object</code> | <code>{}</code> | Jailed bindings for the code. |
| [options.outraw] | <code>boolean</code> | <code>false</code> | Allow `outraw` (raw HTML) output. |

