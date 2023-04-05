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
    _function_chain: Array<Func> = [];
    _value: any;

    set value(value) {
        const errors = [];

        // Check required constrain.
        if ( (this.option.required) && (value === UNDEF) ) {
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
        if ( (this.option.required) && (this._value === UNDEF) ) {
            throw new RequiredError(`Field is required`);
        }
        return this._value;
    }

    get default() {
        if (this.option.default instanceof Function) {
            return this.option.default();
        } else {
            return this.option.default;
        }
    }

    constructor(option: FieldOption = {
        required: true,
        default: UNDEF,
        grant: []
    }) {
        this.option = option;
        this._value = option.default;
    }

    /** Reset value to default or UNDEF */
    reset() {
        this._value = this.option.default;
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