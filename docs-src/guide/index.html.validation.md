<div id="validation" class="link-padding-top"></div>

## Validation

There are 2 scenarios to validate data:
**Schema Validation** & **Atomic Object Validation**

### 1. Schema Validation
This scenario can apply by calling `Model().test(data)`,
which will validates data and return useful information for furthur usage.

```js
Package.test({
    'name': 'edictor',
    'version': '0.4.0',
})
```