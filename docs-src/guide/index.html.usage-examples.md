<div id="usage-examples" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

## Usage Examples

<el-title-code>Javascript / ES6+</el-title-code>
```js
/** Schema Test */
const result = Package.test({
    'name': 'edictor',
    'version': '0.4.0',
    'homepage': 'https://nitipit.github.io/edictor/'
})

/** Atomic Instance */
const package = new Package({
    'name': 'edictor', // Required field
})

package['version'] = '0.4.0';
```