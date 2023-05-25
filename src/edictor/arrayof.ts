import {
    is_function,
    is_class,
    assert,
    Class
} from './util';


export class SetValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SetValueError';
    }
}

export class PushError extends Error {
    constructor(message) {
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
                try {
                    target._validate_value_with_all_validators(key, value);
                } catch (error) {
                    const errorMessage = `[${key}] => ${value}`;
                    throw new SetValueError(`Expect (${target.validators_names}), got errors at:`
                        + `\n   ${errorMessage}`);
                }
                return Reflect.set(target, key, value, receiver);
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
            return this.get_validator_name(validator);
        })
        return names;
    }

    get_validator_name(validator: ValidatorType) {
        if (validator instanceof Array) {
            let names = [];
            for (const v of validator) {
                names.push(this.get_validator_name(v));
            }
            return `[${names}]`;
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
        let errors = [];
        for (const i in values) {
            try {
                const value = this._validate_value_with_all_validators(i, values[i]);
                if (value !== undefined) {
                    values[i] = value;
                }  
            } catch (error) {
                let value_string = values[i];
                if (value_string instanceof Array) {
                    value_string = `[${value_string}]`;
                }
                errors.push(`\n\t[${i}] => ${value_string}`)
            }
        }
        if (errors.length > 0) {
            throw new PushError(`Expect (${this.validators_names}), got errors:`
                + `${errors}`
            )
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
    _validate(value, validator: ValidatorType): void|ArrayOf {
        // If validator is a primative type.
        if (typeof(validator) === "string") {
            assert(typeof(value) === validator);
            return;
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
            return;
        }
        // If validator is a Class
        if (is_class(validator)) {
            assert(value instanceof validator);
            return;
        }
    }

    /** validate a value */
    _validate_value_with_all_validators(key, value): any {
        /** Isolate validators by cloning to a new one */
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
            return value_;
        }
        const msg = `Expect (${this.validators_names}), got errors at: ${key} => ${value}`;
        throw new SetValueError(msg);
    }
}