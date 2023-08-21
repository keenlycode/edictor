<div id="usage-examples" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

## Usage Examples

<el-title-code>Javascript / ES6+</el-title-code>
```js
/** Schema validation */
Package.validate({
    'name': 'example',
    'version': '0.0.1',
    'homepage': 'http://example.com'
})

/** Atomic Instance */
const pk = new Package({
    'name': 'example', // Required field
    'version': '0.0.1' // Required field
})

pk['version'] = '0.0.2';
```