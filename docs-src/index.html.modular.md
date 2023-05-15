## Modular & Self-contained

`People` data can be created separately and attach to corresponding field.
Each field also has it's own validations and will be processed
only if the field's data is set.

```javascript
const author = new People({
    name: "Author",
    email: "author@somewhere.com"
})

const contributor = new People({
    name: "Some Contributor",
    email: "contributor@somewhere.com"
})

// Only ['author'] field will go through validation process.
edictor["author"] = author;

// Only ['contributors'] field will go through validation process.
edictor["contributors"].push(contributor);
```