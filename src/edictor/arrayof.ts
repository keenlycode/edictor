import {
    is_function,
    is_class,
    assert,
    Class
} from './util';

export class ErrorObject extends Error {
    /** return readable error object */
    static errorInfo(error): Object {
        const errorInfo = {};
        for (const [key, value] of Object.entries(error)) {
            if (value instanceof ErrorObject) {
                errorInfo[key] = this.errorInfo(value);
                continue;
            }
            if (value instanceof Error) {
                errorInfo[key] = `${value.name}(${value.message})`
                continue;
            };
        }
        return errorInfo;
    }

    constructor(message='Object contains errors') {
        super(message);
        this.name = 'ErrorObject';
    }

    /** Error object */
    error: Object;

    /** Readable error information */
    errorInfo: Object;

    /** Set error object */
    setError(error: Object): ErrorObject {
        this.error = error;
        this.errorInfo = ErrorObject.errorInfo(error);
        this.message += '\nYou can catch `error` then inspect' +
            ' `error.error` or `error.errorInfo` for more detail';
        this.message += "\n" + JSON.stringify(this.errorInfo, null, 4);
        return this;
    }
}


export class SetError extends ErrorObject {
    constructor(message='') {
        super(message);
        this.name = 'SetError';
    }
}

export class PushError extends ErrorObject {
    constructor(message='') {
        super(message);
        this.name = 'PushError';
    }
}


export class SetValueError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'SetValueError';
    }
}

export class ValidationError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'ValidationError';
    }
}

export interface ArrayTestResult {
    valid?: object,
    invalid?: object,
    error?: object
}

export type ValidatorType = string|Function|Class|any|Array<any>;

/** Modified array which check it's members instance. */
export class ArrayOf extends Array {

    /** propery to keep validators */
    protected _validators: Array<ValidatorType> = [];

    constructor(...validators: Array<ValidatorType>) {
        super();
        // keep validators for setting a new value.
        this._validators = [...validators];

        return new Proxy(this, {
            get(target, key: PropertyKey, receiver): any {
                return Reflect.get(target, key, receiver);
            },
            set(target, key: string, value, receiver): boolean {
                if (key === "length") {
                    return Reflect.set(target, key, receiver);
                }
                try {
                    target._validate_value_with_validators(value);
                } catch (error) {
                    throw new SetValueError(`{${key}: ${error}}`)
                }
                return Reflect.set(target, key, receiver);
            },
            ownKeys(target) {
                /**
                 * Remove internal function from keys()
                 * by returning target as a new Array();
                 */
                return Reflect.ownKeys(new Array(...target));
            }
        });
    }

    get validators() {
        return this._validators;
    }

    /** validate a value with a validator */
    _validate(value, validator: ValidatorType): ArrayOf|any {
        // If validator is a primative type.
        if (typeof(validator) === "string") {
            assert(typeof(value) === validator,
                `${value} => must be instance of ${validator}`);
            return;
        }

        if (validator instanceof Array) {
            assert(value instanceof Array,
                `value must be instance of Array`)
            const array = new ArrayOf(...validator);
            array.set(...value);
            return;
        }
        // If validator is a Function
        if (is_function(validator)) {
            validator(value);
        }
        // If validator is a Class
        if (is_class(validator)) {
            assert(value instanceof validator);
            return;
        }
    }

    /** validate a value */
    _validate_value_with_validators(value, validators=this.validators): object {
        validators = [...validators];
        let value_pass_once = false;
        let value_;
        if (validators.length === 0) {
            return {"value": value_};
        }

        for (const validator of validators) {
            try {
                value_ = this._validate(value, validator);
                value_pass_once = true;
                break;
            } catch {};
        }
        if (value_pass_once) {
            return value_
        }
        
        throw new ValidationError(
            `Expect ArrayOf(${this.validators_to_string(validators)})`
        )
    }

    validators_to_string(validators=this.validators): string {
        validators = [...validators];
        const names = validators.map((validator)  => {
            return this.validator_to_string(validator);
        })
        return `${names}`;
    }

    validator_to_string(validator: ValidatorType): string {
        if (validator instanceof Array) {
            return `[${this.validators_to_string(validator)}]`;
        }
        if (is_function(validator)) {
            return `${(validator as Function).name}()`;
        }
        if (is_class(validator)) {
            return (validator as Class).name;
        }
        if (typeof(validator) === "string") {
            return `"${validator}"`;
        }
    }

    _push_skip_proxy(...values): number {
        let length = this.length;
        for (const value of values) {
            super[length] = value;
            length += 1;
        }
        return length;
    }

    test(values): ArrayTestResult {
        const validators = [...this.validators];
        values = [...values];
        let testResult: ArrayTestResult = {
            "valid": {},
            "invalid": {},
            "error": {}
        };
        for (const i in values) {
            try {
                this._validate_value_with_validators(values[i], validators);
                testResult['valid'][i] = values[i];
            } catch (error) {
                testResult['invalid'][i] = values[i];
                testResult['error'][i] = error;
            }
        }
        return testResult;
    }

    set(...values) {
        values = [...values];
        const result = this.test(values);
        if (Object.keys(result["error"]).length > 0) {
            throw new SetError().setError(result['error']);
        }
        this.length = 0;
        this._push_skip_proxy(...Object.values(result["valid"])); 
    }

    push(...values): number {
        values = [...values];
        const result = this.test(values);
        if (Object.keys(result["error"]).length > 0) {
            throw new PushError().setError(result['error']);
        }
        return this._push_skip_proxy(...Object.values(result["valid"]));
    }

    /** Return a new native object with same data */
    object(): Array<any> {
        const object = [...this];
        return object;
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }
}