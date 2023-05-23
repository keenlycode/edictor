<div class="flex flex-center width-100">
<h2>Error Handling</h2>
</div>

**Error Handling** is another key feature of **{ Edictor }**.
`ModelError` class and it's subclasses contains error information according
to the Model structure.
```shell
ModelError
├── DefineError
├── InitError
└── UpdateError
```

JSON message has a structure as:
```js
// error.message
{
    info: "Information about error",
    field: {} // Object contains `FieldError` message correspond to Model's fields structure.
}
```
You can use `JSON.parse(error.message)` to create object and control
the error information.

Example:
```js
try {
    edictor.update({
        name: "{ Edictor }",
        version: "a.b.c", // Validation error
        homepage: "invalid url"
    })
} catch (error) { // error is an instance of UpdateJsonError
    const message = JSON.parse(error.message);
    // Do something with message object
};
```