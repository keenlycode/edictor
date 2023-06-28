import { expect, test } from '@jest/globals';
import {
    instance,
    assert,
    apply,
    regexp,
    arrayOf,
    model,
    ValidationError
} from './validator';
import { Model, ValidateError } from './model';
import { defineField } from './field';
import { SetError } from './arrayof';


test('instance', () => {
    class A {};
    const validator = instance('string', 'number', A);
    validator('a');
    validator(1);
    validator(new A());
    expect(() => { validator(true) }).toThrow(ValidationError);
});

test('assert', () => {
    const currency = assert(function currency(value) {
        if (['THB', 'USD'].includes(value)) {
            return true;
        }
        return false;
    }, (func, value) => { return `currency must be either 'THB' or 'USD'` });
    currency('THB');
    currency('USD');
    expect( () => { currency('BTC') }).toThrow(ValidationError);
});

test('apply', () => {
    const string_to_date = apply((value: string) => {
        const date = new Date(value);
        if (isNaN(Number(date))) {
            throw new Error(`Invalid string for date`);
        }
        return date;
    })
    let date: any = new Date();
    date = string_to_date(date.toString());
    expect(date).toBeInstanceOf(Date);
    date = 'abc';
    expect(() => { string_to_date(date) }).toThrowError();
})

test('regexp', () => {
    const email = regexp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    email('user@example.com');
    expect(() => {email('user@example')}).toThrow(ValidationError);
})

test.only('arrayOf()', () => {
    let arrayDef;
    arrayDef = arrayOf('string', 'boolean');
    arrayDef(['a', 'b', true]);
    expect(() => arrayDef(1)).toThrow(ValidationError);

    /** Test with defineField() */
    const numberDef = defineField({name: 'number'}).instance('number');
    arrayDef = arrayOf(numberDef);
    arrayDef([1,2]);
    expect(() => {arrayDef([true])}).toThrow(SetError);

    /** Test with Model */
    class User extends Model {};
    User.define({
        'name': defineField().instance('string')
    })
    arrayDef = arrayOf(User);
    const user1 = new User({name: 'user-1'});
    const user2 = new User({name: 'user-2'});
    arrayDef([user1, user2]);

});

test('model()', () => {
    class User extends Model {};
    User.define({
        'name': defineField().instance('string')
    })
    const userValidator = model(User);
    const user_data = {"name": "User Name"};
    let user = userValidator(user_data);
    expect(() => { user = userValidator({"name": 1}) }).toThrow(ValidateError);
});