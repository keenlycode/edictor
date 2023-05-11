```javascript
edictor['version'] = 1; // This line will throw errors below.

/** Uncaught ModelError: ["version"] => FieldError: Field({name: "version"})
 *  - Expect instance(string) but got number
 *  - "1" doesn't pass Regular Expression
*/ 
```