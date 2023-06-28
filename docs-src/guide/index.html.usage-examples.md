<div id="usage-examples" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

## Usage Examples

<el-title-code>Javascript / ES6+</el-title-code>
```js
/** Schema validation */
Package.validate({
    'name': 'edictor',
    'version': '0.4.0',
    'homepage': 'https://nitipit.github.io/edictor/'
})

/** Atomic Instance */
const pk = new Package({
    'name': 'edictor', // Required field
})

pk['version'] = '0.4.0';
```