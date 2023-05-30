<h2 style="margin-top: 5rem;">Flexible & Powerful</h2>

<div class="flex flex-center">
    <img src="data-tree.webp">
</div>

`{Edictor}` support building schema for both nested and array data.
Moreover, data pass through schema can becomes atomic instance
which can validate itself in real-time when data has been changed,
garantee that data is always valid.

Example usage:
```js
class Website extends Model {};

Website.define({
    title: DefineField()
        .instance("string")
        .assert((title) => { title.length <= 250 },
            "Title must have 250 characters or less"),
    url: DefineField()
        .instance("string")
        .apply((value) => new URL(value));
})

/** Validate data, return validation result object */
const reslt = Website.test({url: 'https://example.com'});

/** Create atomic data instance */
const website = new Website();
website.url = 'https://example.com' // valid.
website.url = 'abc' // => Throw errors.
```