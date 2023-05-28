import { test } from '@jest/globals';
import { Model, defineField } from './edictor';

test('Usage Test', () => {
    /** ES Module */
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

    /** Define model `People` */
    People.define({
        name: defineField({required: true})
            .instance('string'),
        email: defineField()
            .instance('string')
            .regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        url: urlDef
    })

    /** Define model `Package` */
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
        contributors: // Array data using `arrayOf()` which contains `People`
            defineField({initial: []}) // Set initial data for calling `push()`
            .arrayOf(People)
    })

    const edictor = new Package({
        "name": "Edictor",
        "version": "0.3.2",
        "homepage": "https://github.com/nitipit/edictor"
    });

    class PackageFlexy extends Package {};
    PackageFlexy.define({}, {strict: false});

    const edictorFlexy = new PackageFlexy({
        name: "edictor-flexy",
        version: "0.1.2",
        phone: "+66 123 4567",
    });

    const somePackage = new Package({
        name: "some-package",
        version: "1.0.0",
        phone: "+66 123 4567" // Can set data to undefined fields.
    }, {strict: false});
    somePackage["undef"] = "Can set data to undefined fields";

    const author = new People({
        name: "Author",
        email: "author@somewhere.com"
    })

    const contributor = new People({
        name: "Some Contributor",
        email: "contributor@somewhere.com"
    })

    edictor['author'] = author;
    edictor['contributors'].push(contributor);

    new Package(edictor.object());
})