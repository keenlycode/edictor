<div id="nesting-data" class="link-padding-top"></div>

## Nesting Data

From the schema definition, **Package** contains nesting data in the field
named **author**.

<el-title-code>Javascript / ES6+</el-title-code>
```js
const authur = new People({
    name: 'author',
    email: 'author@example.com'
})
package['author'] = author; // valid
package['author'] = {...author}; // valid
package['author']['url'] = 'url'; // invalid, throws errors.
```
