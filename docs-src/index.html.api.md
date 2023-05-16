Did you notice ? There are only fews and concise validation APIs:
`instance()`, `regexp()`, `assert()`, `apply()`, `arrayOf()`, `model()`
to validate any kind of javascript object. These APIs make
**{ Edictor }** easy to learn, remember and use.

```js
declare class DefineField {

    instance(...types: any[]): DefineField;
    /** Check instance type
     * @param {...(string|Class)} types - type for instance test
     *     Use string for primative type test, for example:
     *     'string', 'number', 'boolean'
     */
    
    regexp(regexp_: RegExp): DefineField;
    assert(func: (value: any) => boolean, msg?: string | Function): DefineField;
    apply(func: Function): DefineField;
    arrayOf(...validators: Array<string | Function> | any): DefineField;
    model(model_class: typeof Model): DefineField;
    field(option?: FieldOption): Field;
}
```