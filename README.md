# MarkdownScript

Markdown powered scripts.

Note: This package needs to be bundled with
[jailed](https://github.com/asvd/jailed)

## Usage

In HTML:

```html
...
<div id="scriptid"></div>
...
```

In JS (not deferred):

```javascript
let script = new mds.Script("scriptid", code, bindings)
```

## MDS format

Markdown with scripting capabilities. Variables are marked with double curly
braces (`{{}}`). They all follow the same format, `{{type:name:data}}`, where
the type and data follows the table below, the name is unique and the `:data`
is optional. The code itself is written after the markdown, and is separated
with `{{{{`. It needs to be javascript. To get functions like the `Math` module,
you need to include them in the `bindings` argument. The script must be a
function, with two arguments, the arguments themselves in an object, and the
return callback. The arguments' name are the mds `name` attribute (see example
below). The output will be displayed in the order they are declared, so each
argument of the callback function represents a variable with `outraw` or `outmd`
type.

## Types

| Type      | Description           | Function | Data                    |
| --------- | --------------------- | -------- | ----------------------- |
| shorttext | Short text input.     | Input    | Text placeholder.       |
| text      | Textarea.             | Input    | Text placeholder.       |
| checkbox  | Returns boolean.      | Input    | No Use.                 |
| options   | Selection of strings. | Input    | Comma separated values. |
| outmd     | Displays markdown.    | Output   | No Use.                 |
| outraw    | Displays html.        | Output   | No Use.                 |
| run       | Button to run script. | Run      | Button Text             |

## Example

```javascript
# Fibonacci Generator

Enter amount of numbers: {{shorttext:n}}

{{run:button:Generate!}}

{{outraw:output1}}

{{{{
function run({n = "10"}, ret){
	n = Number(n) - 2
	let fib = [0, 1]
	for(let i = 0; i < n; i++){
		fib.push(fib.slice(-2).reduce((a, b) => a + b, 0))
	}
	ret(fib)
}
```
