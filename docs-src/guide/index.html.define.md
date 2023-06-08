<h2 id="define">Define Models / Schemas</h2>

To begins, let's try to define a models / schemas for some parts of
npm's <a href="https://docs.npmjs.com/cli/v9/configuring-npm/package-json/" target=_blank>
package.json</a>, which is a good example since it has a good documentation and
complex enough to demonstrate **{Edictor}** APIs.

`class Model` and `defineField()` is two main cores APIs to start with.
They are carfully designed to be readable by themselve. If you know
**Javascript**, just read one by one line and you will get an idea how
**{Edictor}** APIs work in no time at all, trust me ! :)

<el-title-code>javascript / es6+</el-title-code>
```javascript
/** ES Module */
import { Model, defineField } from 'edictor';

/** Every defined model class must extended from `Model` */
class Package extends Model {};
class People extends Model {};

/** Define reusable `defineField()` as `urlDef` to validates that:
 * - The value must be a string instance.
 * - The value is a valid URL by applying value to built-in `URL()`,
 *   which expect function to throw error if the data is invalid.
 */
const urlDef = defineField()
    .instance('string')
    .apply((value) => { new URL(value) })

/** Define `People` schema
 * - definedField() can be used directly as a schema's field.
*/
People.define({
    name: defineField({required: true})
        .instance('string'),
    email: defineField()
        .instance('string')
        .regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    url: urlDef // Reuseable `urlDef`
})

/** Define `Package` schema */
Package.define({
    name: defineField({required: true})
        .instance('string')
        .assert((value) => { return value.length <= 214 },
            "The name must be less than or equal to 214 characters"),
    version: // https://ihateregex.io/expr/semver/
        defineField({required: true})
        .instance('string')
        .regexp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/),
    homepage: urlDef, // Reuseable `urlDef`
    author: // Nesting data using `model()`
        defineField()
        .model(People),
    contributors: // Array data using `arrayOf()`
        defineField({initial: []}) // Set initial data for calling `push()`
        .arrayOf(People)
})
```
<div style="margin-top: 1rem;"></div>

<el-title-blockquote>Tips</el-title-blockquote>

> Notice, 