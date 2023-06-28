import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { DefineField, defineField, Field, RequiredError, ValidateError } from './field';
import { ArrayOf } from './arrayof';
import { Model } from './model';


describe('Test for normal usage', () => {

    const name = defineField({required: true})
        .instance('string')
        .assert((name) => { return name.length <= 250 })
        .field();
    const email = defineField({required: true})
        .instance('string')
        .regexp(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/)
        .field();
    const phone = defineField()
        .instance('string')
        .regexp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)
        .field();

    test('Valid', () => {
        name.validate('Firstname Lastname');
        email.validate('user@example.com');
        phone.validate('+11 111 1111');
    })

    test('Invalid', () => {
        expect(() => { name.validate() }).toThrow(RequiredError);
        expect(() => { name.validate(1) }).toThrow(ValidateError);
        expect(() => { email.validate('abc.com') }).toThrow(ValidateError);
    })
})

describe('Field Unit Test', () => {

    let field = new Field();

    beforeEach(() => {
        field = new Field();
    })

    test('Field().constructor', () => {
        const option = {
            required: true,
            initial: null,
            grant: [null]
        }
        let field = new Field(option);
        expect(field.option).toEqual(option);        
    })

    test('Field().validators', () => {
        function test() {};
        expect(field.validators).toEqual([]);
        field.validators.push(test);
        expect(field.validators[0]).toEqual(test);
    })

    test('Field().validate()', () => {
        let def = defineField().instance('string')
            .assert((value) => { return value.length <= 100 })
        /** Valid value */
        def.field().validate('test');

        /** undefined value */
        def.field().validate(undefined);
        expect(() => { def.field().validate(1)} ).toThrow(ValidateError);

        /** When `field` is required and validate `undefined` value
         * it must throw `RequiredError`
         */
        field = def.field({required: true});
        expect(() => { field.validate(undefined) }).toThrow(RequiredError);

        /** `field.value = null` will throw `ValidateError`
         * since it's not passed validations.
          */
        expect(() => { field.validate(null) }).toThrow(ValidateError);

        /** grant [null] to always pass validations */
        field = defineField().field({grant: [null]});
        field.validate(null);

        /** field.validators contain `arrayOf` */
        field = defineField().arrayOf('string').field();
        field.validate(['a', 'b']);
    });
})

describe('DefineField Unit Test', () => {

    test('DefineField.defaultOption', () => {
        expect(DefineField.defaultOption).toEqual({
            required: false,
            initial: undefined,
            grant: []
        })
    })

    test('DefineField.constructor', () => {
        let option = {required: true};
        let defField = defineField(option);
        expect(defField.option).not.toEqual({...DefineField.defaultOption});
        expect(defField.option).toEqual({...DefineField.defaultOption, ...option});

        /** Immutable Test */
        let defineField1 = defineField().instance('string');
        expect(defineField().validators).toEqual([]);
        expect(defineField1).not.toBe(defineField);
        expect(defineField1.validators.length > defineField().validators.length)
            .toBeTruthy();
        expect(defineField1.validators[0].name).toEqual('instance');
    })

    test('DefineField().option', () => {
        expect(defineField().option).toEqual(DefineField.defaultOption);
    })

    test('DefineField().validators', () => {
        expect(defineField().validators).toEqual([]);
    })

    test('DefineField().instance()', () => {
        let defineField1 = defineField().instance('string');
        expect(defineField1.validators[0].name).toEqual('instance');
    })

    test('DefineField().regexp()', () => {
        let defineField1 = defineField().regexp(/.{1,100}/);
        expect(defineField1.validators[0].name).toEqual('regexp');
    })

    test('DefineField().assert()', () => {
        let defineField1 = defineField().assert((value) => { return value > 0 });
        expect(defineField1.validators[0].name).toEqual('assert');
    })

    test('DefineField().apply()', () => {
        const string_to_date = (value) => {
            const date = new Date(value);
            if (isNaN(Number(date))) {
                throw new Error(`Invalid string for date`);
            }
            return date;
        }

        let field = defineField().apply(string_to_date).field();
        let date: any = new Date();
        expect(field.validate(date.toString()).toString()).toEqual(date.toString());
        expect(() => { field.validate('abc') }).toThrowError();
    })

    test('DefineField().arrayOf()', () => {
        let defineField1 = defineField().arrayOf('string');
        expect(defineField1.validators[0].name).toEqual('arrayOf');
        const field = defineField1.field();
        let result = field.validate(['a', 'b']);
        expect(result).toEqual(['a', 'b']);
        expect(() => {field.validate([1, 2])}).toThrow(ValidateError);
    })

    test('DefineField().model()', () => {
        class User extends Model {};
        User.define({
            "name": defineField().instance('string')
        })
        let userField = defineField().model(User).field();
        const user_data = {"name": "User Name"};
        let user = userField.validate(user_data);
        expect(user).toEqual(user_data);
        expect(() => { userField.validate({"name": 1})}).toThrow(ValidateError);
    })
})