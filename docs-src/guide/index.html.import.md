<h2 id="import">Import</h2>

**{ Edictor }** support both Browser & Node environment.

<h3 id="import-browser">Browser (ES6+)</h3>

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


<h3 id="import-node">Node (ES6+ & CommonJS)</h3>

**ES Module (Preferred)**

<el-title-code>ES6+</el-title-code>
```js
import { Model, defineField } from 'edictor';
```

**CommonJS Module**

<el-title-code>CommonJS</el-title-code>
```js
const edictor = required('edictor');
// edictor.Model;
// edictor.defineField; 
```