<div id="validations" class="link-padding-top"></div>

## Schema

<div id="validations.1-schema-validation" class="link-padding-top"
    style="margin-top: -4rem;">
<div>

### 1. Schema Validation
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    /** Expected to throws errors if data is invalid */
    static validate(data: Object, option?: ModelOption): Object;
}
```
Calling `Model.validate(data)`, this scenario will validate
data with the schema, expected to throw errors if data is invalid.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
// Data is valid
Package.validate({
    name: 'example',
    version: '0.0.1'
})

// Data is invalid, throw errors.
Package.validate({
    version: '0.0.1',
    homepage: 'http://example.com'
})
```

<el-title-code>Browser console error</el-title-code>
```js
Uncaugth ValidateError ...
```

<div id="validations.2-partial-validation" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

### 2. Partial Validation
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    /** Expected to throws errors if data is invalid */
    static partial(data: Object, option?: ModelOption): Object;
}
```
Calling `Model.partial(data)`, this scenario validates only
fields correspond to input data, or in others words, the schema will ignore
required fields. This might come in handy when you want to use/reuse only
some of schema fields to validate data.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
Package.partial({
    'version': '0.0.1'
})
```

<div id="verifications.3-schema-test" class="link-padding-top"
    style="margin-top: -3rem;">
<div>