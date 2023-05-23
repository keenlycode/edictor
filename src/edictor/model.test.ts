import { beforeEach, describe, expect, test } from '@jest/globals';
import {
    DefineError,
    CallError,
    InitError,
    UpdateError,
    InputDataError,
    Model
} from './model';
import { defineField, Field, FieldError } from './field';
import { DataTestResult } from './schema';


test('Usage Test', () => {
    class Package extends Model {};
    class People extends Model {};


    /** Validate url by using URL() and throw error if not valid */
    const urlDef = defineField()
        .instance('string')
        .apply((value) => { new URL(value) })

    People.define({
        name: defineField({required: true})
            .instance('string'),
        email: defineField()
            .instance('string')
            .regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        url: urlDef
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
        homepage: urlDef,
        author: /** Nested data */
            defineField()
            .model(People),
        contributors: defineField({initial: []})
            .arrayOf(People)
    })

    const edictor = new Package({
        "name": "Edictor",
        "version": "0.1.2",
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
        phone: "+66 123 4567"
    }, {strict: false})

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


describe('class Model', () => {
    class User extends Model {};
    User.define({
        name: defineField({required: true})
            .instance('string'),
        phone: defineField()
            .instance('string')
            .regexp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/),
        enable: defineField({initial: false}).instance('boolean')
    });

    test('Model.define()', () => {
        expect(Object.keys(User.field)).toEqual(['name', 'phone', 'enable']);
        expect(User.field['name'] instanceof Field);
        expect(User.field['name'].name).toEqual('name');

        try {
            Model.define()
        } catch (error) {
            expect(error).toBeInstanceOf(CallError);
            // console.log(error.message);
        }

        class Test extends Model {};

        try {
            Test.define({'property': 1})
        } catch (error) {
            expect(error).toBeInstanceOf(DefineError);
            /** Test that error.message is a valid JSON */
            JSON.parse(error.message);
        }

        class ModelDefineError extends Model {};

        try {
            ModelDefineError.define({
                name: defineField({initial: 1}).instance('string')
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DefineError);
            /** Test that error.message is a valid JSON */
            JSON.parse(error.message);
        }
    })

    test('Model.field()', () => {
        const field = User.field;
        expect(field).toEqual(User.field);
    })

    test('Model.constructor()', () => {
        try {
            new User([1,2,3]);
        } catch (error) {
            expect(error).toBeInstanceOf(InputDataError);
        }
        expect(() => { new User(1)}).toThrow(InputDataError);

        let user = new User({
            "name": "Firstname Lastname"
        });
        user['phone'] = '+11 111 1111';
        expect(() => {user['name'] = 1}).toThrow(FieldError);
        expect(() => {user['phone'] = '124abc'}).toThrow(FieldError);
        expect(() => { new User([1,2,3]) }).toThrow(InputDataError);
        expect(() => { user['gender'] = 'm' }).toThrow(FieldError);
        delete user['phone'];
        expect(user['phone']).toEqual(undefined);

        /** Flexy model */
        user = new User({
            "name": "Firstname Lastname",
            "gender": "m"
        }, {strict: false});

        expect(user['gender']).toEqual('m');
        expect({...user}).toEqual(user);
        
        /** Error on initial data */
        expect(() => { new User({name: 1}) }).toThrow(InitError);

        /** Initial data with undefined field */
        expect(() => { 
            new User({
                "name": "Firstname Lastname",
                "gender": "m"
            })
        }).toThrow(InitError);
    });

    test('Model().object()', () => {
        let user = new User({
            "name": "Firstname Lastname"
        });
        expect(user.object()).toEqual({...user});
    })

    test('Model().json()', () => {
        let user = new User({
            "name": "Firstname Lastname"
        });
        expect(JSON.parse(user.json())).toEqual(user);
    })

    test('Model().update()', () => {
        let user = new User({
            "name": "First Last"
        });
        expect(() => { user.update({name: "test", phone: 1}) })
            .toThrow(UpdateError);

        expect(user).toEqual({name: "First Last", enable: false});

        user.update({name: "test", phone: "+66 111 1111"});
        expect(user).toEqual({name: "test", phone: "+66 111 1111", enable: false});
    })
})