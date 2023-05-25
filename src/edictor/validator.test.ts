import { beforeEach, describe, expect, test } from '@jest/globals';
import { instance, assert, apply, regexp, arrayOf, model, ValidationError } from './validator';
import { ArrayOf } from './validator';
import { Model, InitError } from './model';
import { defineField } from './field';


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

test('arrayOf()', () => {
    const values = ['a', 'b', 0, 1];
    const numberDef = defineField({'name': 'number'}).instance('number');
    let array: any = arrayOf('string', numberDef);
    array = array(...values);
    expect(array).toBeInstanceOf(ArrayOf);
    expect(array).toEqual(values);

    class User extends Model {};
    User.define({
        'name': defineField().instance('string')
    })
    array = arrayOf(User);
    const user_data = {"name": "User Name"};
    let user = new User(user_data);
    array = array(user);

    array = arrayOf(['string', 'number'])
    array = array([1,2]);
});

test('model()', () => {
    class User extends Model {};
    User.define({
        'name': defineField().instance('string')
    })
    const userModel = model(User);
    const user_data = {"name": "User Name"};
    let user = userModel(user_data);
    expect(() => { user = userModel({"name": 1}) }).toThrow(InitError);
});