<div class="flex flex-center width-100">
<h2>Atomic update</h2>
</div>

`Model().update(data: object)` operates as all or nothing.

```js
try {
    edictor.update({
        name: "{ Edictor }",
        version: "a.b.c" // Validation error
    })
} catch (e) {};

edictor.object(); // Get same data as before `update()`.
```