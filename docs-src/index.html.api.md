<h2 class="width-100" style="text-align: center;">
    APIs to help, not to mess things up.
</h2>

No overwhelming APIs, the APIs are simple, easy to use
but desined to enhance javascript expressions and statements
to validate any kind of javascript object/data.

```js
declare class DefineField {
    constructor(option = {required: false, grant: [], initial: undefined});
    instance(...types); // Validate data instance to be one of provided types.
    regexp(regexp_); // Validate data with regular expression.
    assert(func, msg); // Validate with function to be true or false.
    apply(func); // Validate data by using function and set value to returned data.
    arrayOf(...validators); // Validate array data.
    model(model_class); // Validate nested data.
}
```

Example usage:
```js
// Please note that APIs are chainable.
urlDef = DefineField().instance("string").apply((value) => new URL(value));
urlDef.field().validate('abc') // => Uncaught TypeError: Failed to construct 'URL': Invalid URL
```