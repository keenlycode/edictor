import { beforeEach, describe, expect, test } from '@jest/globals';
import { DefineError, Model, ModelError } from './model';
import { defineField, Field } from './field';


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
            .assert((value) => { return value.length <= 250 }),

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

    expect(() => {account['name'] = 1}).toThrow(ModelError);
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
            .regexp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)
    });
    let user: User;

    test('Model.define()', () => {
        expect(Object.keys(User._define)).toEqual(['name', 'phone']);
        expect(User._define['name'] instanceof Field);
        expect(User._define['name'].name).toEqual('name');

        expect(() => { Model.define() }).toThrow(DefineError);
        class Test extends Model {};
        expect(() => { Test.define({'property': 1}) }).toThrow(DefineError);
    })

    test('Model.constructor()', () => {
        expect(() => { new User([1,2,3]) }).toThrow(ModelError);
        expect(() => { new User(1)}).toThrow(ModelError);

        user = new User({
            "name": "Firstname Lastname"
        });
        user['phone'] = '+11 111 1111';
        expect(() => {user['name'] = 1}).toThrow(ModelError);
        expect(() => {user['phone'] = '124abc'}).toThrow(ModelError);
        expect(() => { new User([1,2,3]) }).toThrow(ModelError);
        expect(() => { user['gender'] = 'm' }).toThrow(ModelError);
        delete user['phone'];
        expect(user['phone']).toEqual(undefined);

        /** Unstricted model */
        user = new User({
            "name": "Firstname Lastname",
            "gender": "m"
        }, {strict: false});

        expect(user['gender']).toEqual('m');
        expect({...user}).toEqual(user);
        
        /** Error on initial data */
        expect(() => { new User({name: 1}) }).toThrow(ModelError);

        /** Initial data with undefined field */
        expect(() => { 
            new User({
                "name": "Firstname Lastname",
                "gender": "m"
            })
        }).toThrow(ModelError);
    });

    test('Model.object()', () => {
        user = new User({
            "name": "Firstname Lastname"
        });
        expect(user.object()).toEqual({...user});
    })
})