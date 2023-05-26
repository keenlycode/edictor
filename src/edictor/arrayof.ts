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
    proxy;
    revoke;

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
                        errorMessage: `Expect (${target.validators_names})`,
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

    get validators_names() {
        const validators = [...this.validators];
        const names = validators.map((validator)  => {
            let name = this.get_validator_name(validator);
            if (name instanceof Array) {
                return `[${name}]`;
            }
            return name;
        })
        return names;
    }

    get_validator_name(validator: ValidatorType) {
        if (validator instanceof Array) {
            let names = [];
            for (const v of validator) {
                names.push(this.get_validator_name(v));
            }
            return names;
        }
        if ((is_function(validator)) || is_class(validator)) {
            return (validator as Function).name;
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
        for (const i in values) {
            const result = this._validate_value_with_all_validators(values[i]);
            if ("value" in result) {
                valid[i] = values[i];
                values[i] = result["value"];
            } else if ("error" in result) {
                error[i] = values[i];
            }
            // try {
            //     const value = this._validate_value_with_all_validators(i, values[i]);
            //     if (value !== undefined) {
            //         values[i] = value;
            //     }
            // } catch (error) {
            //     let value_string = values[i];
            //     if (value_string instanceof Array) {
            //         value_string = `[${value_string}]`;
            //     }
            //     errors.push(`\n\t[${i}] => ${value_string}`)
            // }
        }
        if (Object.keys(error).length > 0) {
            const errorMessage = {
                "errorMessage": `Expect (${this.validators_names})`,
                "valid": valid,
                "error": error,
            }
            throw new PushError(JSON.stringify(errorMessage));
        }
        // if (errors.length > 0) {
        //     throw new PushError(`Expect (${this.validators_names}), got errors:`
        //         + `${errors}`
        //     )
        // }
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
        return {"error": `Expect (${this.validators_names})`}
    }
}