<div id="validation" class="link-padding-top"></div>

## Validation

### 1. Schema Test
Calling `Model().test(data)`, this scenario will test data with the schema
and return useful information for furthur usage.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
Package.test({
    'name': 'edictor',
    'version': '0.4.0',
})
```

### 2. Schema Validation
Calling `Model.validate(data)`, this scenario will validate data with the schema.
It's expected to throw errors if data is invalid.

### 3. Atomic Instance
