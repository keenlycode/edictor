<div id="atomic-instance" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

## Atomic Instance
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    constructor(data?: Object, option?: ModelOption);
}
```
Atomic instance can keep data object state and garantees that
it's always valid at any point of your code. To apply this scenario,
use `new Model(data)` to create an atomic instance.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
const package = new Package({
    'name': 'edictor',
    'version': '0.4.0',
    'homepage': 'https://nitipit.github.io/edictor/'
})

package['version'] = '0.4.1';

/** This line will throw errors and new data won't be assigned */
package['author'] = 'someone';
```

<div id="atomic-instance.retrieve-data" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

### Retrieve Data

<el-title-code>Javascript / ES6+</el-titile-code>
```js
const packageData = {...package}; // data object
const packageJSON = JSON.stringify(package); // data in JSON
```

<div id="atomic-instance.atomic-update" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

### Atomic Update

`model.update` updates the `data` into instance
only if the whole `data` is valid, in the other hand,
it will throws errors and reject new data if it's invalid.

<el-title-code>Javascript / ES6+</el-title-code>
```js
import { update } from 'edictor';
try {
    update(package, {
        name: "example",
        version: "a.b.c" // Validation error
    })
} catch (e) {};
```