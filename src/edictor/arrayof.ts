import {
    is_function,
    is_class,
    assert,
    Class
} from './util';


export class SetValueError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'SetValueError';
    }
}

export class PushError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'PushError';
    }
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
                const result = target._validate_value_with_all_validators(value);
                if ("value" in result) {
                    value = result["value"];
                    return Reflect.set(target, key, value, receiver);
                } else if ("error" in result) {
                    const errorMessage = {
                        errorMessage: `${result["error"]}`,
                        error: {[key]: value}
                    }
                    throw new SetValueError(JSON.stringify(errorMessage));
                }
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

    validators_to_names(validators=this.validators) {
        validators = [...validators];
        const names = validators.map((validator)  => {
            return this.validator_to_name(validator);
        })
        return names;
    }

    validator_to_name(validator: ValidatorType) {
        if (validator instanceof Array) {
            return this.validators_to_names(validator);
        }
        if (is_function(validator)) {
            return `${(validator as Function).name}()`;
        }
        if (is_class(validator)) {
            return (validator as Class).name;
        }
        return validator;
    }

    _push_skip_proxy(...values): number {
        let length = this.length;
        for (const value of values) {
            super[length] = value;
            length += 1;
        }
        return length;
    }

    push(...values): number {
        values = [...values];
        const valid = {};
        const error = {};
        let result = {};
        for (const i in values) {
            result = this._validate_value_with_all_validators(values[i]);
            if ("value" in result) {
                valid[i] = values[i];
                values[i] = result["value"];
            } else if ("error" in result) {
                error[i] = values[i];
            }
        }
        if (Object.keys(error).length > 0) {
            const errorMessage = {
                "errorMessage": `${result["error"]}`,
                "valid": valid,
                "error": error,
            }
            throw new PushError(JSON.stringify(errorMessage));
        }
        return this._push_skip_proxy(...values);
    }

    /** Return a new native object with same data */
    object(): Array<any> {
        return JSON.parse(JSON.stringify(this));
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }

    /** validate a value with a validator */
    _validate(value, validator: ValidatorType): ArrayOf|any {
        // If validator is a primative type.
        if (typeof(validator) === "string") {
            assert(typeof(value) === validator,
                `${value} => must be instance of ${validator}`);
            return value;
        }

        if (validator instanceof Array) {
            assert(value instanceof Array,
                `value must be instance of Array`)
            const array = new ArrayOf(...validator);
            array.push(...value);
            return array;
        }
        // If validator is a Function
        if (is_function(validator)) {
            validator(value);
            return value;
        }
        // If validator is a Class
        if (is_class(validator)) {
            assert(value instanceof validator);
            return value;
        }
    }

    /** validate a value */
    _validate_value_with_all_validators(value): object {
        let value_pass_once = false;
        let value_;
        if (this.validators.length === 0) {
            return {"value": value_};
        }

        for (const validator of this.validators) {
            try {
                value_ = this._validate(value, validator);
                value_pass_once = true;
                break;
            } catch {};
        }
        if (value_pass_once) {
            return {"value": value_};
        }
        return {"error": `Expect (${this.validators_to_names()})`}
    }
}