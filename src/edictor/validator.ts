import { is_class, is_function } from './util';
import { Field } from './field';
import { DefineField, Model } from './model';
import { ArrayOf as _ArrayOf } from './arrayof';


export class ValidationError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


export class ArrayOf extends _ArrayOf {
    constructor(...validators: Array<string|Function|DefineField|Field|any>) {
        super(...validators);
    }

    _validate_each(value: any, validator: any): void {
        if (validator instanceof DefineField) {
            validator = validator.field();
        }
        if (validator instanceof Field) {
           validator.validate(value);
        }
        super._validate_each(value, validator);
    }

    _validators_to_names(validators_: any): any[] {
        let validators = [...validators_];
        validators = super._validators_to_names(validators);
        for (let i in validators) {
            if (validators[i] instanceof DefineField) {
                validators[i] = validators[i].field();
            }
            if (validators[i] instanceof Field) {
                validators[i] = `Field({name: ${validators[i].name}})`;
            }
        }
        return validators;
    }
}


/** Check instance type
 * @param {...(string|Class)} types - type for instance test
 *     Use string for primative type test, for example:
 *     'string', 'number', 'boolean'
 */
export const instance = (...types) => {
    const wrapper = (value, types): void => {
        let valid = false;
        for (const type of types) {
            /** When type is Class. */
            if (is_class(type)) {
                if (value instanceof type) { valid = true };
            }
            /** When type is primative. */
            if (typeof(type) === 'string') {
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
            if (is_function(message)) {
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
        ...validators: Array<string|Function|DefineField|Field>
    ) : (values) => ArrayOf => {
    /**  Return ArrayOf instance which can validate it's array. */
    const wrapper = (
            values,
            validators: Array<string|Function|DefineField|Field>
        ): ArrayOf => {
        if (!(values instanceof Array)) {
            throw new ValidationError(`${values} is not iterable`);
        };
        const array = new ArrayOf(...validators);
        array.push(...values);
        return array;
    }

    return function arrayOf (values) { return wrapper(values, validators) };
}

/** Validate that value pass `model_class` validation */
export const model = (model_class: typeof Model) => {
    const wrapper = (value, model_class: typeof Model): Model => {
        return new model_class(value);
    }
    return (value) => { return wrapper(value, model_class) };
}