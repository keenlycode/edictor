import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { DefineField, defineField, Field, RequiredError, FieldError } from './field';
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

    beforeEach(() => {
        name.reset();
        email.reset();
        phone.reset();
    })

    test('Valid', () => {
        name.value = 'Firstname Lastname';
        email.value = 'user@example.com';
        phone.value = '+11 111 1111';
    })

    test('Invalid', () => {
        expect(() => { name.value }).toThrow(RequiredError);
        expect(() => { name.value = 1 }).toThrow(FieldError);
        expect(() => { email.value = 'abc.com' }).toThrow(FieldError);
        expect(() => { phone.value = 'abcdef' }).toThrow(FieldError);
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

    test('Field().value', () => {
        const field_validate = jest.spyOn(field, 'validate');
        field.value = 1;
        expect(field_validate).toBeCalled();
        expect(field.value).toEqual(1);
    })

    test('Feild().reset()', () => {
        field.value = 1;
        field.reset();
        expect(field.value).toEqual(undefined);
    })

    test('Field().validate()', () => {
        field = defineField().instance('string').field();
        /** Valid value */
        field.validate('test');

        /** undefined value */
        field.validate(undefined);

        /** When `field` is required and validate `undefined` value
         * it must throw `RequiredError`
         */
        field = defineField().instance('string').field({required: true});
        expect(() => { field.validate(undefined) }).toThrow(RequiredError);

        /** `field.value = null` will throw `FieldError`
         * since it's not passed validations.
          */
        expect(() => { field.validate(null) }).toThrow(FieldError);

        /** grant [null] to always pass validations */
        field = defineField().field({grant: [null]});
        field.validate(null);

        /** field.validators contain `arrayOf` */
        field = defineField().arrayOf('string').field();
        field.validate(['a', 'b']);
    });
})

describe('DefineField Unit Test', () => {

    test('DefineField.option', () => {
        expect(DefineField.option).toEqual({
            required: false,
            initial: undefined,
            grant: []
        })
    })

    test('DefineField.constructor', () => {
        let option = {required: true};
        let defField = defineField(option);
        expect(defField.option).not.toEqual({...DefineField.option});
        expect(defField.option).toEqual({...DefineField.option, ...option});

        /** Immutable Test */
        let defineField1 = defineField().instance('string');
        expect(defineField().validators).toEqual([]);
        expect(defineField1).not.toBe(defineField);
        expect(defineField1.validators.length > defineField().validators.length)
            .toBeTruthy();
        expect(defineField1.validators[0].name).toEqual('instance');
    })

    test('DefineField().option', () => {
        expect(defineField().option).toEqual(DefineField.option);
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

        const validate_date_string = (value) => {
            const date = new Date(value);
            if (isNaN(Number(date))) {
                throw new Error(`Invalid string for date`);
            }
        }

        let field = defineField().apply(string_to_date).field();
        let date: any = new Date();
        field.value = date.toString();
        expect(field.value.toString()).toEqual(date.toString());
        expect(() => { field.value = 'abc' }).toThrowError();
        
        field = defineField().apply(validate_date_string).field();
        field.value = date.toString();
        expect(field.value).toEqual(date.toString());
    })

    test('DefineField().arrayOf()', () => {
        let defineField1 = defineField().arrayOf('string');
        expect(defineField1.validators[0].name).toEqual('arrayOf');
        const field = defineField1.field();
        field.value = ['a', 'b'];
        expect(field.value).toBeInstanceOf(ArrayOf);
        expect(field.value).toEqual(['a', 'b']);
        expect(() => {field.value = [1, 2]}).toThrow(FieldError);
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
        expect(() => { userField.validate({"name": 1})}).toThrow(FieldError);
    })
})