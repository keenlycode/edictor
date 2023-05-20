<div class="flex flex-center width-100">
<h2>Strict or flexy schema</h2>
</div>

### Strict
By default, `Model.define()` will return `strict` schema. The data
can't be assigned to undefined fields.

```js
edictor['phone'] = '+66 123 4567';
```
will throw an error
```shell
Uncaught ModelError: Package()["phone"] is not defined
```

### Flexy
To use a schema in flexy mode, Use `Model.define({}, {strict: false})`.
The code below will extend `Package` and make it a flexy schema.

```js
/** `PackageFlexy` will inherit all defined fields from `Package` */
class PackageFlexy extends Package {};

/** More fields can be defined. In this case, we just pass define option */
PackageFlexy.define({}, {strict: false});

const edictorFlexy = new PackageFlexy({
    name: "edictor-flexy",
    version: "0.1.2",
    phone: "+66 123 4567" // Now can set a value to undefined fields.
});
```