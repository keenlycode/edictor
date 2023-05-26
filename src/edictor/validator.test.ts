import { beforeEach, describe, expect, test } from '@jest/globals';
import { instance, assert, apply, regexp, arrayOf, model, ValidationError } from './validator';
import { ArrayOf } from './validator';
import { Model, InitError } from './model';
import { defineField } from './field';
import { SetValueError, PushError } from './arrayof';


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
    let array;
    const values = ['a', 'b', true];
    array = arrayOf('string', 'boolean');
    expect(() => array(1)).toThrow(ValidationError);
    array = array(values);
    expect(array).toBeInstanceOf(ArrayOf);
    expect(array).toEqual(values);

    /** Test with defineField() */
    const numberDef = defineField({name: 'number'}).instance('number');
    array = arrayOf(numberDef);
    array = array();
    array[0] = 1;
    array.push(2);
    expect(array).toEqual([1,2]);

    expect(() => {array[0] = true}).toThrow(SetValueError);
    expect(() => array.push(true)).toThrow(PushError);
    expect(array).toEqual([1,2]);

    /** Test recursive array */
    array = arrayOf([numberDef]);
    array = array();
    array[0] = [1];
    array[0].push(2);
    expect(array).toEqual([[1,2]]);
    expect(() => array[0].push([true])).toThrow(PushError);
 
    /** Test with Model() */
    class User extends Model {};
    User.define({
        'name': defineField().instance('string')
    })
    const user_data = {"name": "User Name"};
    array = arrayOf(User);
    let user = new User(user_data);
    array = array([user]);
    expect(array[0].object()).toEqual(user.object());

    /** Test with Model() by native object */
    array[0] = user_data;
    expect(array[0]).toEqual(user_data);

    /** Test recursive array with Model() and defineField() */
    array = arrayOf([User, numberDef], "string");
    array = array();
    array.push([user_data, 1], 'a');
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