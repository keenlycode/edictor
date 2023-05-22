import * as Validator from './validator';
import { ArrayOf } from './validator';
import { Model } from './model';
import { Class } from './util';


/** Error class to show when setting value doesn't pass validation. */
export class FieldError extends Error {
    name: string;
    constructor(message='') {
        super(message);
        this.name = 'FieldError';
    }
}


/** Error class to show when required value is undefined */
export class RequiredError extends Error {
    name: string;
    constructor(message='') {
        super(message);
        this.name = 'RequiredError';
    }
}


export interface FieldOption {
    name?: string;
    required?: boolean;
    initial?: any;
    grant?: any[];
}


export class Field {

    constructor(option: FieldOption = {}) {
        this._setOption(option);
    }

    get name() {
        return this._option.name;
    }

    set name(value) {
        this._option.name = value;
    }

    protected _validators: Array<(value) => any> = [];

    get validators() {
        return this._validators;
    }

    set validators(validators: Array<(value) => any>) {
        this._validators = validators;
    }

    protected _option: FieldOption = DefineField.option;

    protected _setOption(option: FieldOption = {}) {
        option = {...DefineField.option, ...option};
        if (option.initial !== undefined) {
            this.validate(option.initial);
        }
        if (this.value === undefined) {
            this._value = option.initial;
        }
        this._option = option;
    }

    get option(): FieldOption {
        return this._option;
    }

    protected _value: any;

    /** Set field's value if pass validators */
    set value(value) {
        this._value = this.validate(value);
    }

    /** Get Field's value
     * - Required field will throw RequiredError if ask for value
     *   before assigned.
     */
    get value() {
        if ( (this._option.required) && (this._value === undefined) ) {
            throw new RequiredError(`Required field is undefined`);
        }
        return this._value;
    }

    /** Reset to initial value */
    reset(): void {
        this._value = this._option.initial;
    }

    /** Validate field's value
     * - Return value if valid.
     */
    validate(value): any {
        const errors = [];
        if (value === undefined) {
            /** Check required constrain. */
            if (this._option.required) {
                throw new RequiredError(`Field is required`);
            } else { /** Return immediatly to skip validations */
                return;
            }
        }

        /** Check with grant values to skip validations */
        if (this._option.grant.includes(value)) {
            return value;
        }

        /** Validate and assign return value if undefined */
        for (const validator of this.validators) {
            try {
                const value_ = validator(value);
                if (value_ !== undefined) {
                    value = value_;
                }
            } catch (e) {
                errors.push(e.message);
            }
        }
        let msg = `Field({name: "${this.name}"})`;
        for (const error of errors) {
            msg += `\n - ${error}`
        }
        if (errors.length > 0) {
            throw new FieldError(msg);
        }
        return value;
    }
}


export class DefineField {

    static option: FieldOption = {
        required: false,
        initial: undefined,
        grant: []
    }

    constructor(
            option: FieldOption = {},
            validators: Array<(value) => (void|ArrayOf|Model)> = []
    ) {
        this._setOption(option);
        this._validators = [...validators];
    }

    protected _option: FieldOption = DefineField.option;

    protected _setOption(option: FieldOption) {
        this._option = {...this._option, ...option};
    }

    get option(): FieldOption {
        return this._option;
    }

    protected _validators: Array<(value) => (void|ArrayOf|Model)>;

    get validators() {
        return this._validators;
    }

    /** Validate field's value to be an instance of provide types or classes.
     * Use string to validate primative type, for example:
     * ```
     * defineField().instance('string', 'number');
     * ```
     */
    instance(...types: Array<string|Class>): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.instance(...types)]);
    }

    /** Validate by regular expression
     * Example:
     * ```
     * defineField().regexp(/.*.html$/);
     * ```
     */
    regexp(regexp_: RegExp): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.regexp(regexp_)]);
    }

    /** Assert field's value with provided function (value) => boolean.
     * Example:
     * ```
     * defineField().assert((value) => { return value <= 10 });
     * ```
     */
    assert(func: (value: any) => boolean, msg: string|Function = 'Assertion error'): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.assert(func, msg)]);
    }

    /** Apply function to field's value. 
     * Field's value can be changed to the return value from function.
     * Example:
     * ```
     * defineField().instance('string').apply(function string_to_number(value) { return Number(value) });
     * ```
     */
    apply(func: Function): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.apply(func)]);
    }

    /** Validate field's value to be an array of provided validators
     * - To validate primative types: use string such as 'string', 'number' etc.
     * - Function validator must throw error if value is not valid.
     * - Class validator.
     */
    arrayOf(...validators: Array<string|Function|Class|DefineField|Field>): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.arrayOf(...validators)]);
    }

    /** Validate object to pass the Model validation
     * Useful for nested data.
     */
    model(model_class: typeof Model): DefineField {
        return new DefineField(
            this.option,
            [...this.validators, Validator.model(model_class)]);
    }

    /** Get Field() instance */
    field(option: FieldOption = {}): Field {
        option = {...this.option, ...option};
        const field = new Field(option);
        field.validators = [...this.validators];
        return field;
    }
}

export const defineField = (option: FieldOption = {}) => {
    return new DefineField(option);
}