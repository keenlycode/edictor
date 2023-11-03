# Setup

<div id="setup.installation" class="link-padding-top"></div>

## Installation

<el-title-code>shell</el-title-code>
```shell
$ npm install edictor
```

<div id="setup.import" class="link-padding-top"></div>

## Import

**{ Edictor }** support both Browser & Node environment.

<div id="import.browser" class="link-padding-top" style="margin-top: -4rem;"></div>

<h3>Browser (ES6+)</h3>

There's no **javascript** building tool is expected in browser environment.
Therefore, all dependencies are included in `edictor.js`.
Just copy `node_modules/edictor/dist/browser/edictor.js` to somewhere
which can be accessed by browsers. Then `import` inside `<script type="module">`

<el-title-code>html</el-title-code>
```html
<script type="module">
import { Model, defineField } from 'url/to/edictor';
</script>
```

<div id="import.node" class="link-padding-top" style="margin-top: -4rem;"></div>

<h3 style="margin-top: 2rem;">Node (ES6+ & CommonJS) / Build Tools</h3>

<el-title-blockquote>Note</el-title-blockquote>
> `Edictor` is built with [**Parcel**](https://parceljs.org/). However, it
> should be compatible with any Javascript bulid tools.
<br>

**ES Module (Preferred)**

<el-title-code>ES6+</el-title-code>
```js
import { Model, defineField } from 'edictor';
```
<br>

**CommonJS Module**

<el-title-code>CommonJS</el-title-code>
```js
const edictor = require('edictor');
// edictor.Model;
// edictor.defineField; 
```