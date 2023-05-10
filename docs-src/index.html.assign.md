```javascript
edictor = new Package({
    "name": "Edictor",
    "version": "0.0.1",
    "homepage": "https://github.com/nitipit/edictor"
})

edictor['version'] = 1; // This line will throw errors below.

/** Uncaught ModelError: ["version"] => FieldError: Field({name: "version"})
 *  - Expect instance(string) but got number
 *  - "1" doesn't pass Regular Expression
*/ 
```