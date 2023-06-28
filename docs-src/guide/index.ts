import './index.style';

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

window.Model = Model;
window.defineField = defineField;
window.Package = Package;
window.People = People;

/** Schema validation */
Package.validate({
    'name': 'edictor',
    'version': '0.4.0',
    'homepage': 'https://nitipit.github.io/edictor/'
})

/** Atomic Instance */
const pk = new Package({
    'name': 'edictor',
    'version': '0.5.0'
})

pk['version'] = '0.5.1';

/** Validations */

// Data is valid
Package.validate({
    name: 'test-package',
    version: '0.0.1'
})

// Data is invalid, throw errors.
try {
    Package.validate({
        version: '0.4.0',
        homepage: 'https://nitipit.github.io/edictor/'
    })
} catch (error) {
    // console.error(error);
};