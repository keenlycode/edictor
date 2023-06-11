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

export class ValidationError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'ValidationError';
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
                const result = target._validate_value_with_validators(value);
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
            return {"value": value_};
        }
        return {"error": new ValidationError(
            `Expect (${this.validators_to_names(validators)})`
        )}
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

    test(values, validators=this.validators) {
        validators = [...validators];
        values = [...values];
        let result: any = {
            "valid": {},
            "invalid": {},
            "error": {}
        };
        for (const i in values) {
            let response = this._validate_value_with_validators(
                values[i], validators);
            if ("value" in response) {
                result['valid'][i] = response["value"];
            } else if ("error" in response) {
                result['invalid'][i] = values[i];
                result['error'][i] = response["error"];
            }
        }
        if (Object.keys(result['error']).length > 0) {
            result['errorMessage'] = `ArrayOf Test Error: Expect (${this.validators_to_names().toString()})`;
        }
        return result;
    }

    push(...values): number {
        values = [...values];
        const result = this.test(values);
        if (Object.keys(result["invalid"]).length > 0) {
            const errorMessage = {
                "errorMessage": result["test"],
                "valid": result["valid"],
                "invalid": result["invalid"]
            }
            throw new PushError(JSON.stringify(errorMessage));
        }
        return this._push_skip_proxy(...Object.values(result["valid"]));
    }

    /** Return a new native object with same data */
    object(): Array<any> {
        return JSON.parse(JSON.stringify(this));
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }
}