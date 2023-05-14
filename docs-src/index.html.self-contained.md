```javascript
edictor['version'] = 1; // This line will throw errors below.
```
<div class="width-100" style="margin-top: 2rem;"></div>

Error
```js
Uncaught ModelError: ["version"] => FieldError: Field({name: "version"})
- Expect instance(string) but got number
- "1" doesn't pass Regular Expression
```