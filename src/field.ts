import { strict as assert } from 'assert';

/** Utility function to check if instance is a Function */
export function is_function(instance) {
    if (
        instance instanceof Function
        && instance.toString().match(/^function/)
    ) {
        return true
    }
    return false
}

/** Utility function to check if instance is a Class */
export function is_class(instance) {
    if (
        instance instanceof Function
        && instance.toString().match(/^class/)
    ) {
        return true
    }
    return false
}


// export class ListOf extends Array {
//     constructor(...args) {
//         super(...args);
//         return new Proxy(this, {
//             get(target, prop, receiver) {
//                 return Reflect.get(target, prop, receiver);
//             },
//             set(obj, prop, value) {
//                 return Reflect.set(obj, prop, value);
//             }
//         });
//     }
// }

/** Class to keep function and it's argument to be called later */
class Func {
    func: Function;
    args: any[];
    constructor(func, ...args) {
        this.func = func;
        this.args = args;
    }

    call(value): any {
        this.func(value, ...this.args);
    }
}


interface FieldOption {
    required?: boolean;
    default?: any;
    grant?: any[];
}

/** Error class to show when values doesn't pass validation. */
class VerifyError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = 'VerifyError';
    }
}

/** Error class to show when required value is undefined */
class RequiredError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super(message);
        this.name = 'RequiredError';
    }
}

/** Error to be raised when field constrains are conflicts */
class DefineError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super(message);
        this.name = 'DefineError';
    }
}

/** Decorator function to add constrain function to function chain */
const function_chain = (
        target: any,
        memberName: string,
        propertyDescriptor: PropertyDescriptor): any => {
    return {
        get() {
            const wrapper = (...args: any[]) => {
                /** Make sure constrain function doesn't conflict with default value */
                const func = propertyDescriptor.value();
                if (this.option.default != undefined) {
                    try {
                        func(this.option.default, ...args);
                    } catch (e) {
                        throw new DefineError(
                            `Field({default: ${this.option.default}) conflicts with `
                            + `${func.name}(${args})`
                            + `\n${e}`
                        )
                    }
                }

                /** Add constrain function to function chain
                 * to be called on validation */ 
                this._function_chain.push(new Func(func, ...args));
                return this;
            }
            return wrapper;
        }
    }
}


/** `Field()` is a Class with abilities to set and validates value
 * according to constaint kept inside `_function_chain`
 * 
 * # Examples
 * 
 * ```javascript
 * // Use with validators.
 * field = Field({required=true}).oneof(['AM', 'PM']);
 * field.value = 'AM'; // Ok
 * field.value = 'A'; // This line will throw VerifyError
 * 
 * // Chained validators.
 * field = Field({default='user@example.com'}).instance(str).search('.*@.*');
 * field.value = 'user@somewhere.com';
 * field.value = 1; This line will throw VerifyError
 * ```
 */
export class Field {

    constructor(option: FieldOption = {
        required: true,
        default: undefined,
        grant: []
    }) {
        this.option = option;
        this._value = option.default;
    }

    option: FieldOption;
    _function_chain: Array<Func> = [];
    _value: any;

    /** Return field's default value */
    get default() {
        if (this.option.default instanceof Function) {
            return this.option.default();
        } else {
            return this.option.default;
        }
    }

    /** Set field's value
     * - verify value by feild's function chain
     * - Set field's value if function return value
     */
    set value(value) {
        const errors = [];

        // Check required constrain.
        if ( (this.option.required) && (value === undefined) ) {
            throw new RequiredError(`Field is required`);
        }
        // Check with grant values
        if (value in this.option.grant) {
            this._value = value;
        }

        // Verify value by function chain
        for (const func of this._function_chain) {
            try {
                // Set field's value if function return value
                let value_ = func.call(value);
                if (value_ != null) {
                    value = value_;
                }
            } catch (e) {
                errors.push((func.func, e));
            }
        }
        if (errors.length > 0) {
            throw new VerifyError(errors.toString());
        }
        this._value = value;
    }

    get value() {
        if ( (this.option.required) && (this._value === undefined) ) {
            throw new RequiredError(`Field is required`);
        }
        return this._value;
    }

    /** Reset value to default */
    reset() {
        this.value = this.option.default;
    }

    /** Check instance type
     * @param {(String|Class)} type - type for instance test
     *     Use String for primative type test, for example:
     *     'string', 'number', 'boolean'
     */
    @function_chain
    instance(type): any {
        let instance: Function;
        return instance = (value, type): any => {
            const msg = `${value} is not an instanceof ${type}`;

            // When type is Class.
            if (is_class(type)) {
                assert(value instanceof type, msg);
            }
            // When type is primative.
            if (typeof(type) === 'string') {
                assert(typeof(value) === type, msg);
            }
        };
    }

    /** listof */
};