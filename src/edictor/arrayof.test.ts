import { beforeEach, describe, expect, test } from '@jest/globals';
import { ArrayOf, SetValueError, PushError } from './arrayof';

describe('class ArrayOf', () => {
    let array;
    let values;

    beforeEach(() => {
        values = ['a', 'b', 0, 1];
        array = new ArrayOf('string', 'number');
        array.push(...values);
    });

    test('new ArrayOf()', () => {
        expect(array).toBeInstanceOf(ArrayOf);
        expect(array).toBeInstanceOf(Array);
        array[0] = 'c';
        expect(() => {array[1] = true}).toThrow(SetValueError);
        expect(() => {array.push(true,true,false)}).toThrow(PushError);

        const arrayOfArray = new ArrayOf(['string', 'number'], 'boolean');
        arrayOfArray.push([1, 'a'], true);
        arrayOfArray[0] = [1, 'b'];
        arrayOfArray[0].push(2);
        expect(() => {arrayOfArray[0].push(true)}).toThrow(PushError);
        expect(() => {arrayOfArray.push([1, 2, true])}).toThrow(PushError);
        expect(() => {arrayOfArray.push([1, 2], 1)}).toThrow(PushError);
        expect(() => {arrayOfArray[0].push(1, true)}).toThrow(PushError);
    })

    test('ArrayOf() validation', () => {
        class A {};
        const a = new A();
        const is_date_string = (value) => {
            let date: any = new Date(value);
            if (isNaN(date)) {
                throw new Error(`value is not a date string`);
            }
        };
    
        /** Primative types and class Validator */
        array = new ArrayOf('string', A);
        array.push('1', a);
        expect(array).toEqual(['1', a])
        
        /** Function validator */
        const date_string_array = ['203-04-27'];
        array = new ArrayOf(is_date_string);
        array.push(...date_string_array);

        /** Invalid date string should return Error */
        expect(() => {array.push('abc')}).toThrow(PushError);
        expect(() => {array[1] = 'abc'}).toThrow(SetValueError);
        
        /** Array isn't changed after set invalid value */
        expect(array).toEqual(date_string_array);
    })
    
    test('ArrayOf().object()', () => {
        expect(array.object()).toEqual(values);
    
        /** Return plain Array */
        expect(array.object()).not.toBeInstanceOf(ArrayOf);
        expect(array.object()).toBeInstanceOf(Array);
    });

    test('ArrayOf().json()', () => {
        expect(JSON.parse(array.json())).toEqual(array);
    });
})