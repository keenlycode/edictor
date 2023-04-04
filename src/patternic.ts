import { strict as assert } from 'assert';

/** Undefined Value */
class _UNDEF {};

const UNDEF = new _UNDEF();

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

const function_chain = (
        target: any,
        memberName: string,
        propertyDescriptor: PropertyDescriptor): any => {
    return {
        get() {
            const func = (...args: any[]) => {
                // To do:
                // Make sure default value does not conflict with this func.
                // ...

                // Add to function chain.
                this._function_chain.push(
                    new Func(propertyDescriptor.value(), ...args)
                );
                return this;
            }
            return func;
        }
    }
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

/** Error class to show when required value is UNDEF */
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

export class Field {
    option: FieldOption;
    _value: any;
    set value(value) {
        
    }
    get value() {
        if ( (this.option.required) && (this._value === UNDEF) ) {
            throw new RequiredError('sadfasdf');
        }
        return this._value;
    }
    _function_chain: Array<Function> = [];

    constructor(option: FieldOption = {
        required: true,
        default: UNDEF,
        grant: []
    }) {
        this.option = option;
        this._value = option.default;
    }

    _validate(value) {
        for (let func of this._function_chain) {
            func.call(value);
        }
    }

    default() {
        if (this.option.default instanceof Function) {
            return this.option.default();
        } else {
            return this.option.default;
        }
    }

    @function_chain
    instance(type): any {
        return (value, type): any => {
            // When type is Class.
            const msg = `${value} is not instanceof ${type}`
            if (typeof(type) === 'function') {
                assert(value instanceof type, msg);
            }
            // When type is primative.
            if (typeof(type) === 'string') {
                assert(typeof(value) === type, msg);
            }
        };
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