import * as util from './util';
import { DefineField } from './field';
import { Model } from './model';
import {
    ArrayOf as _ArrayOf,
    ValidatorType
} from './arrayof';


export class ValidationError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ArrayOf extends _ArrayOf {
    constructor(...validators: Array<ValidatorType|DefineField|Model>) {
        super(...validators);
    }

    _validate(value: any, validator: any): void|ArrayOf {
        if (validator instanceof DefineField) {
            validator = validator.field();
            validator.validate(value);
            return;
        }
        if (validator.prototype instanceof Model) {
            new validator(value);
            return;
        }
        if (validator instanceof Array) {
            util.assert(value instanceof Array,
                `value must be instance of Array`)
            const array = new ArrayOf(...validator);
            array.push(...value);
            return array;
        }
        super._validate(value, validator);
    }

    get_validator_name(validator: ValidatorType) {
        if (validator instanceof DefineField) {
            return `defineField({name: ${validator.field().name}})`;
        }
        return super.get_validator_name(validator);
    }
}

/** Check instance type
 *  Use string for primative type test, for example:
 *  'string', 'number', 'boolean'
  */
export const instance = (...types: Array<string|util.Class>) => {
    const wrapper = (value, types): void => {
        let valid = false;
        for (const type of types) {
            /** When type is a class */
            if (util.is_class(type)) {
                if (value instanceof type) { valid = true };
            }
            /** When type is primative. */
            if (typeof(type) === "string") {
                if (typeof(value) === type) { valid = true };
            }
        }
        if (!valid) {
            const msg = `Expect instance(${types}) but got ${typeof(value)}`;
            throw new ValidationError(msg);
        }
    }
    return function instance(value) { wrapper(value, types) };
}


/** Validate with Regular Expression */
export const regexp = (regexp_: RegExp) => {
    const wrapper = (value: 'string', regexp_: RegExp): void => {
        if (!(regexp_.test(value))) {
            throw new ValidationError(
                `"${value}" doesn't pass Regular Expression => ${regexp_}`
            )
        }
    }
    return function regexp(value) { wrapper(value, regexp_) };
}

/** Assert value with provided function
 * - The provided function must return `true` or `false`
 */
export const assert = (func: (value: any) => boolean, message: string|Function ='') => {
    const wrapper = (value, func, message: string|Function = ''): void => {
        if (!(func(value))) {
            if (util.is_function(message)) {
                message = (message as Function)(func, value);
            }
            throw new ValidationError(message);
        }
    }
    return function assert(value) { wrapper(value, func, message) };
}


/** Apply value to the provided function
 * - Return function result.
 * - Throw error if needed.
*/
export const apply = (func: Function): any => {
    const wrapper = (value, func) => {
        return func(value);
    }
    return function apply(value) { return wrapper(value, func) };
}


/** Check if value is array of something. */
export const arrayOf = (
        ...validators: Array<ValidatorType|DefineField|Model>
    ) : (...values) => ArrayOf => {
    /**  Return ArrayOf instance which can validate it's array. */
    const wrapper = (
            values,
            validators: Array<ValidatorType|DefineField|Model>
        ): ArrayOf => {
        if (!(values instanceof Array)) {
            throw new ValidationError(`${values} is not iterable`);
        };
        const array = new ArrayOf(...validators);
        array.push(...values);
        return array;
    }

    return function arrayOf (...values) { return wrapper(values, validators) };
}

/** Validate that value pass `model_class` validation */
export const model = (model_class: typeof Model) => {
    const wrapper = (value, model_class: typeof Model): Model => {
        return new model_class(value);
    }
    return (value) => { return wrapper(value, model_class) };
}