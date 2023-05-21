<div class="flex flex-center width-100">
    <h2>Define</h2>
</div>

Let's try to define a model / schema for npm's <a href="https://docs.npmjs.com/cli/v9/configuring-npm/package-json/" target=_blank>
package.json</a>.

```javascript
/** ES Module */
import { Model, defineField } from 'edictor';

/** define class `Package` & `People` to ba a schema */
class Package extends Model {};
class People extends Model {};

/** Define reusable `defineField()` as `urlDef`
 * - Data must be string instance.
 * - Validate url by `apply()` which expect function to throw error
 *   if data is not valid.
 */
const urlDef = defineField()
    .instance('string')
    .apply((value) => { new URL(value) })

/** Define `People` model structure */
People.define({
    name: defineField({required: true})
        .instance('string'),
    email: defineField()
        .instance('string')
        .regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    url: urlDef
})

/** Define `Package` model structure */
Package.define({
    name: defineField({required: true})
        .instance('string')
        .assert((value) => { return value.length <= 214 },
            "The name must be less than or equal to 214 characters"),
    version: // https://ihateregex.io/expr/semver/
        defineField({required: true})
        .instance('string')
        .regexp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/),
    homepage: urlDef,
    author: // Nesting data using `model()`
        defineField()
        .model(People),
    contributors: // Array data using `arrayOf()`
        defineField({initial: []}) // Also set initial data
        .arrayOf(People)
})
```