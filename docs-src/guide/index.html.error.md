<div class="flex flex-center width-100">
<h2>Error Detection</h2>
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
interface ModelTestResult {
    valid: object // Valid data based on object structure.
    invalid: object // Invalid data based on object structure.
    error: object // Error information base on data structure.
    errorMessage: string // describe about errors. 
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
} catch (error) { // error is an instance of UpdateError
    const validationResult = JSON.parse(error.message);
    // Do something with ModelTestResult object
};
```

The `validationResult` above will contains information:
```js
{
    "valid": {
        "name": "{ Edictor }",
        "author": {
            "name": "Author",
            "email": "author@somewhere.com"
        },
        "contributors": [
            {
                "name": "Some Contributor",
                "email": "contributor@somewhere.com"
            }
        ]
    },
    "invalid": {
        "version": "a.b.c",
        "homepage": "invalid url"
    },
    "error": {
        "version": "Field({name: \"version\"})\n - \"a.b.c\" doesn't pass Regular Expression => /^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$/",
        "homepage": "Field({name: \"homepage\"})\n - Failed to construct 'URL': Invalid URL"
    },
    "errorMessage": "Package().update(data)\n throw errors"
}
```