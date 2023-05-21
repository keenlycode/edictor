<div class="flex flex-center width-100">
<h2>Strict or Flexy schema</h2>
</div>

### Strict
By default, `Model.define()` is a `strict` schema. It means we can't
assign data to undefined fields.

```js
edictor['phone'] = '+66 123 4567';
```
will throw an error
```shell
Uncaught ModelError: Package()["phone"] is not defined
```

### Flexy
To make a flexible schema, Use `Model.define({}, {strict: false})`.
The code below will extend `Package` and make it a flexy schema.

```js
/** `PackageFlexy` will inherit all defined fields from `Package` */
class PackageFlexy extends Package {};

/** More fields can be defined. However in this case,
 * we just pass define option to make it flexible 
 */
PackageFlexy.define({}, {strict: false});

const edictorFlexy = new PackageFlexy({
    name: "edictor-flexy",
    version: "0.1.3",
    phone: "+66 123 4567" // Now can set a value to undefined fields.
});
```

Another option is to create an object from a model with option `{strict: false}`

```js
const somePackage = new Package({
    name: "some-package",
    version: "1.0.0",
    phone: "+66 123 4567"
}, {strict: false})
/** Set option after data object.
It has the same pattern like setting option in Model.define(); */
```