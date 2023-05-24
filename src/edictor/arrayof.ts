import {
    is_function,
    is_class,
    assert,
    Class
} from './util';


export class ArrayOfError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArrayOfError';
    }
}

export class ArrayOfSetValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArrayOfSetValueError';
    }
}


/** Modified array which check it's members instance. */
export class ArrayOf extends Array {

    constructor(...validators: Array<string|Function|Class>) {
        super();
        this._validators = validators; // keep validators for setting a new value.

        return new Proxy(this, {
            get(target, key: PropertyKey, receiver): any {
                return Reflect.get(target, key, receiver);
            },
            set(target, key: string, value): boolean {
                /** Check if key is instance of Number */
                if (!(isNaN(Number(key)))) {
                    try {
                        target._validate_values([value], target._validators);
                    } catch (error) {
                        const errorMessage = `[${key}] => ${value}`;
                        const validators_names = target._validators_to_names(validators);
                        throw new ArrayOfSetValueError(`Expect (${validators_names}), got errors at:`
                            + `\n   ${errorMessage}`);
                    }
                }
                return Reflect.set(target, key, value);
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

    /** propery to keep validators */
    _validators: Array<string|Function|Class>;

    /** Return a new native object with same data */
    object(): Array<any> {
        return JSON.parse(JSON.stringify(this));
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }

    push(...values: any[]): number {
        this._validate_values(values, this._validators);
        return super.push(...values);
    }

    /** validate a value with a validator */
    _validate_each(value, validator): void|ArrayOf {
        // If validator is a primative type.
        if (typeof(validator) === "string") {
            assert(typeof(value) === validator);
            return;
        }

        if (validator instanceof ArrayOf) {
            assert(value instanceof Array,
                `value must be instance of Array`)
            validator.push(...value);
            return validator;
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

    /** validate all values */
    _validate_values(
            values: Array<any>,
            validators_: Array<string|Function|Class>) {

        /** Isolate validators by cloning to a new one */
        const validators = [...validators_];
        const errors = [];

        for (const i in values) {
            let value_pass_once = false;
            for (const validator of validators) {
                try {
                    const value = this._validate_each(values[i], validator);
                    value_pass_once = true;
                    // if (value instanceof ArrayOf) {
                    //     console.log('return ArrayOf');
                    //     console.log(value.object());
                    // }
                    break;
                } catch {};
            }
            if (!value_pass_once) {
                errors.push(`\n    [${i}] => ${values[i]}`);
            }

        }
        const validators_names = this._validators_to_names(validators);
        const msg = `Expect (${validators_names}), got errors at: ${errors}`;
        if (errors.length > 0) {
            throw new ArrayOfError(msg);
        }
    }
    
    _validators_to_names(validators_) {
        const validators = [...validators_];
        for (let i in validators) {
            const validator = validators[i];
            if (validator instanceof ArrayOf) {
                validators[i] = `ArrayOf(${validator._validators})`;
                continue;
            }
            if ((is_function(validator)) || is_class(validators)) {
                validators[i] = (validators[i] as Function).name;
            }
        }
        return validators;
    }
}