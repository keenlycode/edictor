import { strict as assert } from 'assert';

/** Utility function to check if instance is a Function */
export function is_function(instance) {
    if (!(instance instanceof Function)) {
        return false;
    }
    if (instance.toString().match(/^function/)) {
        return true;
    }
    if (instance.toString().match(/^\(\w*\)/)) {
        return true;
    }
    return false;
}

/** Utility function to check if instance is a Class */
export function is_class(instance) {
    if (!(instance instanceof Function)) {
        return false;
    }
    if (instance.toString().match(/^class/)
    ) {
        return true;
    }
    return false;
}


/** Class to keep function and it's argument to be called later */
class Func {
    func: Function;
    args: any[];
    constructor(func, ...args) {
        this.func = func;
        this.args = args;
    }

    call(value): any {
        return this.func(value, ...this.args);
    }
}


interface FieldOption {
    required?: boolean;
    default?: any;
    grant?: any[];
}

/** Error class to show when values doesn't pass validation. */
class ValidationError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
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

interface ArrayOfParam {
    /** validator as types or functions */
    validator?: string|Function|Array<string|Function>
}


/** Modified array which check it's members instance. */
export class ArrayOf extends Array {

    /**
     * @param {Array<any>} values - values in an array.
     * @param {ArrayParam}  
     * @returns {ArrayOf}
     */
    constructor(values: Array<any> = [], {
        validator=null
    }: ArrayOfParam = {}) {
        super(...values);
        let validators: Array<string|Function>;

        // Normalize validators to Array
        if (validator instanceof Array<string|Function>) {
            validators = validator;
        } else {
            validators = [validator];
        }
        this._validators = validators; // keep validators for setting a new value.
        this.validate(values, this._validators);

        return new Proxy(this, {
            get(target, key: PropertyKey, receiver): any {
                return Reflect.get(target, key, receiver);
            },
            set(target, key: string|symbol, value): boolean {
                console.log(key, value);
                if (Number(key)) {
                    target.validate([value], target._validators);
                }
                return Reflect.set(target, key, value);
            }
        });
    }

    /** propery to keep validators */
    _validators: Array<string|Function>;

    get object() {
        return [...this];
    }

    /** validate a value with a validator */
    _validate(value, validator) {
        // If validator is a primative type.
        if (typeof(validator) === "string") {
            assert(typeof(value) === validator);
        }
        // If validator is a Function or Class
        else if (is_function(validator as Function)) {
            assert(validator(value));
        }
        else if (is_class(validator)) {
            assert(value instanceof validator);
        }
    }

    validate(values: Array<any>, validators: Array<string|Function>) {
        for (const i in values) {
            let value_pass = false;
            for (let validator of validators) {
                try {
                    this._validate(values[i], validator);
                    value_pass = true;
                    break;
                } catch {};
            }
            if (!value_pass) {
                const msg = `{${i}: ${values[i]}}`
                throw new ValidationError(msg);
            }
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
 * field.value = 'A'; // This line will throw ValidationError
 * 
 * // Chained validators.
 * field = Field({default='user@example.com'}).instance(str).search('.*@.*');
 * field.value = 'user@somewhere.com';
 * field.value = 1; This line will throw ValidationError
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

    /** Return field's default value */
    get default() {
        if (this.option.default instanceof Function) {
            return this.option.default();
        } else {
            return this.option.default;
        }
    }

    _value: any;
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
            return;
        }

        // Verify value by function chain
        for (const func of this._function_chain) {
            try {
                let value_ = func.call(value);
                if (value_) {
                    if ((value instanceof ArrayOf)
                        ||  (value instanceof Model)
                    ) {
                        value = value_
                    } else {
                        throw new DefineError(
                            `Validation function ` +
                            `doesn't return ArrayOf or Model class`
                        )
                    }
                }
            } catch (e) {
                errors.push((func.func, e));
            }
        }
        if (errors.length > 0) {
            throw new ValidationError(errors.toString());
        }
        this._value = value;
    }

    get value() {
        return this._value;
    }

    /** Reset value to default */
    reset() {
        this.value = this.option.default;
    }

    /** Check instance type
     * @param {(string|Class)} type - type for instance test
     *     Use string for primative type test, for example:
     *     'string', 'number', 'boolean'
     */
    @function_chain
    instance(type): Function {
        const instance = (value, type): void => {
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
        return instance;
    }

    /** Check if value is array of something. */
    @function_chain
    arrayOf(validator: string|Function|Array<string|Function> = undefined)
            : Function {
        // Return ArrayOf instance which can validate it's array.
        const arrayOf = (
                values: Array<any> = [],
                validator: string|Function|Array<string|Function> = undefined)
                : ArrayOf => {
            return new ArrayOf(values, {
                validator: validator
            });
        }
        return arrayOf;
    }

    /** Validate that value pass `model_class` validation */
    @function_chain
    model(model_class: 'Model'): Function {
        const model = (value, model_class): Model => {
            return new model_class(value);
        }
        return model;
    }

    //** Validate with Regular Expression */
    @function_chain
    regexp(regexp_: RegExp): Function {
        const regexp = (value: 'string', regexp_: RegExp): void => {
            assert(
                regexp_.test(value),
                `Value doesn't pass Regular Expression => `
                + `${regexp_}`
            );
        }
        return regexp;
    }

    @function_chain
    validate(func, msg=null): Function {
        const validate = (value, func): void => {
            assert(func(value), msg);
        }
        return validate;
    }

};

export class Model extends Map {
    constructor(data: Object) {
        super();
        if (data instanceof Array) {
            throw new Error("data can't be an instance of Array");
        }
        if (!(data instanceof Object)) {
            throw new Error("data must be an instance of Object");
        }
        for (let key in data) {
            this.set(key, data[key]);
        }
    }

    get(key: any) {
        return super.get(key);
    }

    set(key: any, value: any): this {
        super.set(key, value);
        return this;
    }
    

    to_json() {
        let json = {};
        for (let [key, value] of this) {
            if (value instanceof Map) {
            }
            json[key] = value
        }
        return json;
    }
    to_string() {
        return JSON.stringify(this.to_json());
    }
}