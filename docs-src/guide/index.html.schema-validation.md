<div id="schema-validation" class="link-padding-top"></div>

## Schema Validation

<div id="validation.1-schema-test" class="link-padding-top"
    style="margin-top: -4rem;">
<div>

### 1. Schema Test
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    static test(data: Object, option?: ModelOption): ModelTestResult;
}
```
Call `Model.test(data)` to apply this scenario, which will test data
and return useful information for furthur usage.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
const result = Package.test({
    'name': 'edictor',
    'version': '0.4.0',
    'email': 'test@example.com'
});
```

<el-title-code>result</el-titile-code>
```js
{
    "valid": {
        "name": "edictor",
        "version": "0.4.0",
        "contributors": []
    },
    "invalid": {
        "email": "test@example.com"
    },
    "error": {
        "email": UndefinedError(...) // UndefinedError Object
    },
    "errorMessage": "Testing contains errors."
}
```

<div id="validation.2-schema-partial-test" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

### 2. Schema Partial Test
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    static partial(data: Object, option?: ModelOption): ModelTestResult;
}
```
Call `Model.partial(data)` to apply this scenario, which will test only
fields correspond to input data, or in others words, the schema will ignore
required/initial fields. This might come in handy when you want to use/reuse only
some of schema fields to test data.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
const result = Package.partial({
    'version': '0.4.0' // only test on `version` fields
})
```

<el-title-code>result</el-titile-code>
```js
{
    "valid": {
        "version": "0.4.0"
    },
    "invalid": {},
    "error": {}
}
```

<div id="validation.3-schema-validation" class="link-padding-top"
    style="margin-top: -3rem;">
<div>

### 3. Schema Validation
<el-title-code>Typescript declaration</el-titile-code>
```ts
class Model {
    /** Expected to throws errors if data is invalid */
    static validate(data: Object, option?: ModelOption): Object;
}
```
Call `Model.validate(data)` to apply this scenario, which will validate
data and return valid data. This function expected to throw errors
if data is invalid.

<el-title-code>Javascript / ES6+</el-titile-code>
```js
Package.validate({
    version: '0.4.0',
    homepage: 'https://nitipit.github.io/edictor/'
})
```

<el-title-code>Browser console</el-title-code>
```js
Uncaugth ValidateError ...
```