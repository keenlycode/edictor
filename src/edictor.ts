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


/** Error class to show when values doesn't pass validation. */
class FieldError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = 'FieldError';
    }
}

class ValidationError extends Error {
    name: string;
    message: string;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class ArrayOfError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super(message);
        this.name = 'ArrayOfError';
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
                if (this.option.initial != undefined) {
                    try {
                        func(this.option.initial, ...args);
                    } catch (e) {
                        throw new DefineError(
                            `Field({default: ${this.option.initial}) conflicts with `
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
        const error_indexes = [];
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
                error_indexes.push(i);
            }
        }
        if (error_indexes.length > 0) {
            const message = `index: [${error_indexes}] not pass ArrayOf validation`;
            throw new ArrayOfError(message);
        }
    }
}


interface FieldOption {
    required?: boolean;
    initial?: any;
    grant?: any[];
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
 * field.value = 'A'; // This line will throw FieldError
 * 
 * // Chained validators.
 * field = Field({default='user@example.com'}).instance(str).search('.*@.*');
 * field.value = 'user@somewhere.com';
 * field.value = 1; This line will throw FieldError
 * ```
 */
export class Field {
    static default_option = {
        required: false,
        initial: undefined,
        grant: []
    }

    constructor(option: FieldOption = {}) {
        this.option = {...Field.default_option, ...option};
        this._value = this.option.initial;
    }

    option: FieldOption;
    _function_chain: Array<Func> = [];
    _value: any;

    /** Set field's value
     * - verify value by feild's function chain
     * - Set field's value if function return value
     */
    set value(value) {
        value = this.test(value);
        this._value = value;
    }

    /** get Field's value
     * - Required field will throw RequiredError if ask for value
     *   before assigned.
     */
    get value() {
        if ( (this.option.required) && (this._value === undefined) ) {
            throw new RequiredError(`Field is required`);
        }
        return this._value;
    }

    /** Reset value to default */
    reset() {
        this.value = this.option.initial;
    }

    test(value) {
        const errors = [];
        if (value === undefined) {
            // Check required constrain.
            if (this.option.required) {
                throw new RequiredError(`Field is required`);
            } else { // If field is not required.
                // Dont' just let value == undefined but delete it.
                delete this._value;
                // Then return like the value haven't been set
                // since it doesn't have to be validated.
                return;
            }
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
                if(!value_) { continue };
                if (['model', 'arrayOf'].includes(func.func.name)) {
                    value = value_;
                } else {
                    throw new DefineError(
                        `Validation function ` +
                        `doesn't return ArrayOf or Model class`
                    )
                }
            } catch (e) {
                errors.push(e);
            }
        }
        if (errors.length > 0) {
            throw new FieldError(errors);
        }
        return value;
    }

    /** Check instance type
     * @param {(string|Class)} type - type for instance test
     *     Use string for primative type test, for example:
     *     'string', 'number', 'boolean'
     */
    @function_chain
    instance(type): Function {
        const instance = (value, type): void => {
            let valid = false;

            // Normalize type to Array
            if (!(type instanceof Array)) {
                type = [type];
            }

            for (const t of type) {
                // When type is Class.
                if (is_class(t)) {
                    if (value instanceof t) { valid = true };
                }
                // When type is primative.
                if (typeof(t) === 'string') {
                    if (typeof(value) === t) { valid = true };
                }
            }
            if (!valid) {
                const msg = `${value} is not an instanceof ${type}`;
                throw new ValidationError(msg);
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
    model(model_class): Function {
        const model = (value, model_class): Model => {
            return new model_class(value);
        }
        return model;
    }

    /** Validate with Regular Expression */
    @function_chain
    regexp(regexp_: RegExp): Function {
        const regexp = (value: 'string', regexp_: RegExp): void => {
            if (!(regexp_.test(value))) {
                throw new ValidationError(
                    `"${value}" doesn't pass Regular Expression => ${regexp_}`
                )
            }
        }
        return regexp;
    }

    /** Validate value with provided function
     * - The provided function must return `true` or `false`
     */
    @function_chain
    validate(func: Function, msg=''): Function {
        const validate = (value, func): void => {
            assert(func(value), msg);
        }
        return validate;
    }
};


class ModelError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super(message);
        this.name = 'ModelError';
    }
};


interface ModelOption {
    strict?: boolean
}

export class Model {
    static _model = {};
    static option: ModelOption;

    static model(model: Object = {}, option: ModelOption = {}) {
        this.option = {...{strict: true}, ...option};
        for (const [key, value] of Object.entries(model)) {
            // `continue` loop if the value isn't instance of Field().
            if (!(value instanceof Field)) {
                throw new ModelError(`${key}: not instance of Field`)
            };
            // Keep Field() in this._model for data validation.
            this._model[key] = value;
        }
        return this;
    }

    constructor(data: Object = {}) {
        if (data instanceof Array) {
            throw new Error("data can't be an instance of Array");
        }
        if (!(data instanceof Object)) {
            throw new Error("data must be an instance of Object");
        }

        const proxy = new Proxy(this, {
            get: (target, key: PropertyKey, receiver): any => {
                return Reflect.get(target, key, receiver);
            },
            set: (target, key: string, value: any): boolean => {
                const _class = target.constructor as typeof Model;
                const field = _class._model[key];
                if (field === undefined) {
                    if (_class.option.strict) {
                        throw new ModelError(`property ['${key}'] is not defined`)
                    } else {
                        target[key] = value;
                        return true;
                    }
                }
                try { field.test(value) } catch (e) {
                    throw new ModelError(`property ['${key}']: ${e}`)
                };
                return Reflect.set(target, key, value);
            },
            deleteProperty: (target, key): boolean => {
                const _class = target.constructor as typeof Model;
                const field = _class._model[key];
                if (field) { field.test(undefined) };
                return Reflect.deleteProperty(target, key);
            },
        });

        const _class = this.constructor as typeof Model;

        for (const key in _class._model) {
            proxy[key] = data[key];
            delete data[key];
        }

        if (_class.option.strict) {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                throw new ModelError(`Data keys [${keys}] exeeds defined fields`)
            }
        } else {
            Object.assign(proxy, data);
        }
        return proxy;
    }
}