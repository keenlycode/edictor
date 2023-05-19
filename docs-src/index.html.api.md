<h2 class="width-100" style="text-align: center;">Concise APIs</h2>

Did you notice ? There are only fews and concise validation APIs:
`instance()`, `regexp()`, `assert()`, `apply()`, `arrayOf()`, `model()`
to validate any kind of javascript object. These APIs make
**{ Edictor }** easy to learn, remember and use.

Chain validators APIs for `defineField()` 
```js
instance(...types: Array<string | Class>): DefineField;
regexp(regexp_: RegExp): DefineField;
assert(func: (value: any) => boolean, msg?: string | Function): DefineField;
apply(func: Function): DefineField;
arrayOf(...validators: Array<string | Function | Class | DefineField | Field>): DefineField;
model(model_class: typeof Model): DefineField;
```