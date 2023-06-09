import { beforeEach, describe, expect, test } from '@jest/globals';
import { ArrayOf, SetValueError, PushError } from './arrayof';
import { AssertError, assert } from './util';
import { Model, defineField } from '../edictor';

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
    })

    test('ArrayOf()._validate()', () => {
        let validator: any = ['string', 'boolean'];
        array = new ArrayOf();
        expect(array._validate([true, 'a'], validator)).toEqual([true, 'a']);
        expect(() => array._validate([1, 'a'], validator)).toThrow(PushError);

        validator = (value) => { assert(value <= 100) };
        expect(array._validate(100, validator)).toEqual(100);

        class Test {};
        const test = new Test();
        validator = Array;
        expect(array._validate(test, Test)).toEqual(test);
        expect(() => array._validate('a', Test)).toThrow(AssertError);
    })

    test('ArrayOf()._validate_value_with_validators()', () => {
        array = new ArrayOf();
        array._validate_value_with_validators(1, []);
        array._validate_value_with_validators(true, ['string', 'number']);
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

    test.only('ArrayOf().test()', () => {
        class TestResult extends Model {};
        TestResult.define({
            test: defineField({required: true}).instance("string"),
            valid: defineField().instance("object"),
            invalid: defineField().instance("object"),
            error: defineField().instance('object')
        })

        array = new ArrayOf(['string', 'number']);
        let result = array.test([[1,true]]);
        result = new TestResult(result);
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