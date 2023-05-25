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

export class SetValueError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SetValueError';
    }
}

type ValidatorTypes = Array<string|Function|Class|Array<string|Function|Class>>;


/** Modified array which check it's members instance. */
export class ArrayOf extends Array {

    /** propery to keep validators */
    protected _validators: ValidatorTypes = [];
    protected _revocable;

    constructor(...validators: ValidatorTypes) {
        super();
        // keep validators for setting a new value.
        this._validators = [...validators];

        const revocable = Proxy.revocable(this, {
            get(target, key: PropertyKey, receiver): any {
                return Reflect.get(target, key, receiver);
            },
            set(target, key: string, value, receiver): boolean {
                /** Check if key is instance of Number */
                if (isNaN(Number(key))) {
                    return Reflect.set(target, key, value, receiver);
                }
                try {
                    target._value_pass_one_of_validators(key, value);
                } catch (error) {
                    const errorMessage = `[${key}] => ${value}`;
                    const validators_names = target.validators_to_names(validators);
                    throw new SetValueError(`Expect (${validators_names}), got errors at:`
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
        this._revocable = revocable;
        return revocable.proxy;
    }

    get validators() {
        return this._validators;
    }

    /** Return a new native object with same data */
    object(): Array<any> {
        return JSON.parse(JSON.stringify(this));
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }

    push(...values: any[]): any {
        // this._validate_values(values, this.validators);
        return super.push(...values);
    }

    /** validate a value with a validator */
    _validate_each(value, validator): void|ArrayOf {
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
    _value_pass_one_of_validators(key, value) {
        /** Isolate validators by cloning to a new one */
        let value_pass_once = false;
        for (const validator of this.validators) {
            try {
                const value_ = this._validate_each(value, validator);
                // if (value instanceof ArrayOf) {
                //     this[i] = value;
                // }
                value_pass_once = true;
                break;
            } catch {};
        }
        if (value_pass_once) {
            return
        }
        const validators_names = this.validators_to_names(this.validators);
        const msg = `Expect (${validators_names}), got errors at: ${key} => ${value}`;
        throw new SetValueError(msg);
    }
    
    validators_to_names(validators_) {
        const validators = [...validators_];
        for (let i in validators) {
            const validator = validators[i];
            if (validator instanceof Array) {
                validators[i] = `[${validator}]`;
                continue;
            }
            if ((is_function(validator)) || is_class(validators)) {
                validators[i] = (validators[i] as Function).name;
            }
        }
        return validators;
    }
}

/** Working on this line */
export const ArrayOfProxy = Proxy.revocable(ArrayOf, {
    get(target, key, receiver) {
        console.log(target);
        console.log(key);
        console.log(receiver);
    }
})