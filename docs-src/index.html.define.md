```javascript
import { Model, defineField } from 'edictor/src/edictor';

class Package extends Model {};
class Author extends Model {};

Author.define({
    name: defineField({required: true})
        .instance('string'),
    email: defineField()
        .instance('string')
        .regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    url: /** RegExp might be too slow, let's use URL() and throw Error */
        defineField()
        .instance('string')
        .apply((value) => { new URL(value) })
})

Package.define({
    name: defineField({required: true})
        .instance('string')
        .assert((value) => { return value.length <= 214 },
            "The name must be less than or equal to 214 characters"),
    version: /** https://ihateregex.io/expr/semver/ */
        defineField({required: true})
        .instance('string')
        .regexp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/),
    homepage: defineField()
        .instance('string')
        .apply((value) => { new URL(value) }),
    author: /** Nested data */
        defineField()
        .model(Author)
})
```