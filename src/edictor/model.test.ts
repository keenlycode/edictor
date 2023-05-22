import { beforeEach, describe, expect, test } from '@jest/globals';
import {
    DefineJsonError,
    DefineCallError,
    ModelJsonError,
    UpdateError,
    DataError,
    Model
} from './model';
import { defineField, Field, FieldError } from './field';


test('Usage Test', () => {

    class Account extends Model {};

    const phone = defineField({name: "phone"})
        .instance('string')
        .regexp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)

    const email = defineField({name: "email", required: true})
        .instance('string')
        .regexp(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/)

    Account.define({
        name: defineField({required: true})
            .instance('string')
            .assert((value) => { return value.length <= 250 },
                "The name must be less than or equal to 250 characters"),

        emails: defineField({required: true})
            .arrayOf(email),

        phones: defineField()
            .arrayOf(phone),

        age: defineField()
            .instance('number')
            .assert(
                (value) => { return (value % 1) === 0 },
                (validator, value) => { return `Age ${value} must be a whole number`})
    })

    const account = new Account({
        name: "Firstname Lastname",
        emails: ['user@example.com', 'backup@example.com'],
        phones: ['+66 111 1111'],
        age: 30
    });

    expect(() => {account['name'] = 1}).toThrow(FieldError);
    let emails = account['emails'];
    emails.push('test@email.com');
    account['emails'].push('test@email.com');
    expect(account['emails']).toEqual(emails);
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
            expect(error).toBeInstanceOf(DefineCallError);
            // console.log(error.message);
        }

        class Test extends Model {};

        try {
            Test.define({'property': 1})
        } catch (error) {
            expect(error).toBeInstanceOf(DefineJsonError);
            /** Test that error.message is a valid JSON */
            JSON.parse(error.message);
        }

        class ModelDefineJsonError extends Model {};

        try {
            ModelDefineJsonError.define({
                name: defineField({initial: 1}).instance('string')
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DefineJsonError);
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
            expect(error).toBeInstanceOf(DataError);
            // console.log(error);
        }
        expect(() => { new User(1)}).toThrow(DataError);

        let user = new User({
            "name": "Firstname Lastname"
        });
        user['phone'] = '+11 111 1111';
        expect(() => {user['name'] = 1}).toThrow(FieldError);
        expect(() => {user['phone'] = '124abc'}).toThrow(FieldError);
        expect(() => { new User([1,2,3]) }).toThrow(DataError);
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
        expect(() => { new User({name: 1}) }).toThrow(ModelJsonError);

        /** Initial data with undefined field */
        expect(() => { 
            new User({
                "name": "Firstname Lastname",
                "gender": "m"
            })
        }).toThrow(ModelJsonError);
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