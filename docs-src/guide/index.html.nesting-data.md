<div id="nesting-data" class="link-padding-top"></div>

## Nesting Data

**Package** schema contains nesting data in the field named **author**

<el-title-code>Javascript / ES6+</el-title-code>
```js
Package.define({
    author: defineField().model(People)
})
```