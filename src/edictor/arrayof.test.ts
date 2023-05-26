import { beforeEach, describe, expect, test } from '@jest/globals';
import { ArrayOf, SetValueError, PushError } from './arrayof';
import { assert } from './util';

describe('class ArrayOf', () => {
    let validators: any;
    let array: ArrayOf;

    beforeEach(() => {
        validators = ['string', 'number'];
        array = new ArrayOf(...validators);
    })

    test('new ArrayOf()', () => {
        expect(array).toBeInstanceOf(ArrayOf)
        array[0] = 'test string';
        let error_;
        try {
            array[1] = true;
        } catch (error) {
            error_ = error;
        }
        expect(error_).toBeInstanceOf(SetValueError);
        expect(JSON.parse(error_.message)).toBeInstanceOf(Object);

        // array.push(...values);

        // expect(array).toBeInstanceOf(ArrayOf);
        // expect(array).toBeInstanceOf(Array);
        // array[0] = 'c';
        // expect(() => {array[1] = true}).toThrow(SetValueError);
        // expect(() => {array.push(true,true,false)}).toThrow(PushError);

        // const arrayOfArray = new ArrayOf(['string', 'number'], 'boolean');
        // arrayOfArray.push([1, 'a'], true);
        // arrayOfArray[0] = [1, 'b'];
        // arrayOfArray[0].push(2);

        // expect(() => {arrayOfArray[0].push(true)}).toThrow(PushError);
        // expect(() => {arrayOfArray.push([1, 2, true])}).toThrow(PushError);
        // expect(() => {arrayOfArray.push([1, 2], 1)}).toThrow(PushError);
        // expect(() => {arrayOfArray[0].push(1, true)}).toThrow(PushError);
    })

    test('ArrayOf().validators', () => {
        expect(array.validators).toEqual(validators);
    })

    test('ArrayOf().validators_to_names()', () => {
        const names = array.validators_to_names();
        expect(names).toEqual(validators);
    })

    test('ArrayOf().validator_to_name()', () => {
        let validator = ['string', 'boolean'];
        array = new ArrayOf();

        /** validator is an Array */
        expect(array.validator_to_name(validator)).toEqual(validator);

        /** validator is a function */
        let less_or_eq_100 = (value) => {
            assert(value <= 100, "value must be <= 100")
        }
        expect(array.validator_to_name(less_or_eq_100))
            .toEqual(`${less_or_eq_100.name}()`);

        /** validator is a class*/
        class Package {}
        expect(array.validator_to_name(Package))
            .toEqual(Package.name);
    })

    test('ArrayOf().push()', () => {
        array.push(1,2);
        try {
            array.push(true);
        } catch (error) {
            expect(error).toBeInstanceOf(PushError);
            expect(JSON.parse(error.message)).toBeInstanceOf(Object);
        }
    })

    // test('ArrayOf() validation', () => {
    //     class A {};
    //     const a = new A();
    //     const is_date_string = (value) => {
    //         let date: any = new Date(value);
    //         if (isNaN(date)) {
    //             throw new Error(`value is not a date string`);
    //         }
    //     };
    
    //     /** Primative types and class Validator */
    //     array = new ArrayOf('string', A);
    //     array.push('1', a);
    //     expect(array).toEqual(['1', a])
        
    //     /** Function validator */
    //     const date_string_array = ['203-04-27'];
    //     array = new ArrayOf(is_date_string);
    //     array.push(...date_string_array);

    //     /** Invalid date string should return Error */
    //     expect(() => {array.push('abc')}).toThrow(PushError);
    //     expect(() => {array[1] = 'abc'}).toThrow(SetValueError);
        
    //     /** Array isn't changed after set invalid value */
    //     expect(array).toEqual(date_string_array);
    // })
    
    test('ArrayOf().object()', () => {
        const values = ['a', 'b', 0, 1];
        array = new ArrayOf('string', 'number');
        array.push(...values);

        expect(array.object()).toEqual(values);
    
        /** Return plain Array */
        expect(array.object()).not.toBeInstanceOf(ArrayOf);
        expect(array.object()).toBeInstanceOf(Array);
    });

    test('ArrayOf().json()', () => {
        expect(JSON.parse(array.json())).toEqual(array);
    });
})