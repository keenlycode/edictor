import {describe, expect, test } from '@jest/globals';
import {
    DefineError,
    InitError,
    UpdateError,
    InputDataError,
    UndefinedError,
    Model
} from './model';
import {
    defineField,
    Field,
    ValidateError as FieldValidateError
} from './field';
import { SetValueError } from './model';


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

        expect(() => { User.define({}) }).toThrow(DefineError);

        try {
            Model.define()
        } catch (error) {
            expect(error).toBeInstanceOf(DefineError);
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

    test.only('Model.partial()', () => {
        let data = {
            phone: '+66 123 4567',
            enable: 1,
            test: true,
        }
        let result: any = User.partial(data);
    })


    test('Model.validate()', () => {
        let user: any;
        try {
            user = User.validate({
                phone: '+66 123 4567',
                enable: 1,
                test: true
            })
        } catch (error) {
            expect(Object.keys(error.error)).toEqual(['name', 'enable', 'test']);
            expect(Object.keys(error.errorInfo)).toEqual(['name', 'enable', 'test']);
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
        expect(() => { new User()}).toThrow(InitError);

        let user = new User({
            "name": "Firstname Lastname"
        });
        user['phone'] = '+11 111 1111';
        expect(() => {user['name'] = 1}).toThrow(FieldValidateError);
        expect(() => {user['phone'] = '124abc'}).toThrow(FieldValidateError);
        expect(() => { new User([1,2,3]) }).toThrow(InputDataError);
        expect(() => { user['gender'] = 'm' }).toThrow(SetValueError);
        delete user['phone'];
        expect(user['phone']).toEqual(undefined);

        /** Flexy model */
        user = new User({
            "name": "Firstname Lastname",
            "gender": "m"
        }, {strict: false});
        user["test-undefined"] = "test";

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