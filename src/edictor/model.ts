import {
    Field,
    DefineField,
    ValidateError as FieldValidateError
} from './field';

import { Class } from './util';

class ModelError extends Error {

    /** return readable error object */
    static errorInfo(error): Object {
        const errorInfo = {};
        for (const [key, value] of Object.entries(error)) {
            if (value instanceof ModelError) {
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

    constructor(message='Model contains error') {
        super(message);
        this.name = 'ModelError';
    }

    /** Error object */
    error: Object;

    /** Readable error information */
    errorInfo: Object;

    /** Set error object */
    setError(error: Object): ModelError {
        this.error = error;
        this.errorInfo = ModelError.errorInfo(error);
        this.message += '\nYou can catch `error` then inspect' +
            ' `error.error` or `error.errorInfo` for more detail';
        this.message += "\n" + JSON.stringify(this.errorInfo, null, 4);
        return this;
    }
}

export class DefineError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'DefineError';
    }
}

export class PartialError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'PartialError';
    }
}

export class ValidateError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'ValidateError';
    }
}

export class InitError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'InitError';
    }
}

export class UpdateError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'UpdateError';
    }
}

export class UndefinedError extends Error {
    constructor(message='Field is undeinfed') {
        super(message);
        this.name = 'UndefinedError';
    }
}

export class SetValueError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'SetValueError';
    }
}

export class InputDataError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'InputDataError';
    }
}

interface ModelOption {
    strict?: boolean
}

interface ModelTestResult {
    valid?: object,
    invalid?: object,
    error?: object,
    errorMessage?: string
}


export class Model {
    protected static _define = {};
    static _definedClass: string;
    static _option: ModelOption = {strict: true};

    static define(model: Object = {}, option: ModelOption = {}): typeof Model {
        const superClass = Object.getPrototypeOf(this);
        if (superClass.name === '') {
            throw new DefineError(
                `Model.define() is prohibited. `
                + `It must be called from a subclass`
            );
        }
        if (this._definedClass === this.name) {
            throw new DefineError(`${this} has been defined.`);
        }
        this._option = {...superClass._option, ...option};
        this._define = {...superClass._define};

        const result: ModelTestResult = {
            valid: {},
            invalid: {},
            error: {}
        };

        for (let [key, defineField] of Object.entries(model)) {

            /** Get Field() instance if value is DefineField() */
            let field: Field;

            if (defineField instanceof DefineField) {
                field = defineField.field();
                if (field.name === undefined) { field.name = key };
            } else {
                result["error"][key] = 'Assigned value is not an instance of DefineField'
                continue;
            }

            if (field.option.initial === undefined) {
                result["valid"][key] = defineField;
            } else if (field.option.initial !== undefined) {
                try {
                    field.validate(field.option.initial);
                    result["valid"][key] = defineField;
                } catch (e) {
                    result["error"][key] = `Field({initial: ${field.option.initial}})`
                    + ` conflicts with Field's validation => ${e}`
                }
            }
            model[key] = field;
        }
        if (Object.keys(result["error"]).length > 0) {
            result["errorMessage"] = `${this.name}.define() throw errors`;
            throw new DefineError(JSON.stringify(result));
        }
        this._define = {...this._define, ...model};
        this._definedClass = this.name;
        return this;
    }

    static get field() {
        return {...this._define};
    }

    static _check_input_data(data: Object) {
        if (data instanceof Array) {
            throw new InputDataError(`new ${this.constructor.name}(data) => `
            + `data must be an instance of object. Received Array`);
        }
        if (!(data instanceof Object)) {
            throw new InputDataError(`new ${this.constructor.name}(data) => `
            + `data must be an instance of object, Received ${typeof(data)}`);
        }
    }

    static test(data: Object, option: ModelOption = {}): Object {
        this._check_input_data(data);

        /** Isolate received data */
        data = {...data};
        option = {...this._option, ...option};
        const result: ModelTestResult = {
            valid: {},
            invalid: {},
            error: {}
        };

        /** Iterate defined field to validate and assign data.
         * - Also delete data[key] after assigned.
         */
        for (const key in this.field) {
            const value = data[key];
            delete data[key];
            if (value === undefined) {
                if (this.field[key].option.initial !== undefined) {
                    result['valid'][key] = this.field[key].option.initial;
                    continue;
                }
            }

            try {
                result['valid'][key] = this.field[key].validate(value);
            } catch (error) {
                result['invalid'][key] = value;
                result['error'][key] = error;
            }
        }

        /** If option {strict: true}, add errors as undefined fields */
        if (option.strict === true) {
            for (const key of Object.keys(data)) {
                result["error"][key] = new UndefinedError(`Field is undefined.`);
            }
        } else { /** If option {strict: false}, add all data */
            Object.assign(result['valid'], data);
        }

        return result;
    }

    static partial(data: Object, option: ModelOption = {}): Object {
        const result = this.test(data);
        const valid_keys = Object.keys(result['valid']);
        const data_keys = Object.keys(data);
        if (valid_keys.length !== data_keys.length) {
            throw new PartialError().setError(result['error'])
        }
        if (!(data_keys.every((key) => valid_keys.includes(key)))) {
            throw new PartialError().setError(result['error'])
        }
        return result['valid'];
    }

    static validate(data: Object, option: ModelOption = {}): Object {
        const result = this.test(data, option);

        if (Object.keys(result['error']).length > 0) {
            throw new ValidateError().setError(result['error']);
        }

        return result['valid'];
    }

    protected _option: ModelOption;

    constructor(data: Object = {}, option: ModelOption = {}) {
        const _class = this.constructor as typeof Model;
        option = {..._class._option, ...option};
        this._option = option;

        try {
            data = _class.validate(data, option);
        } catch (error) {
            if (error instanceof ModelError) {
                throw new InitError().setError(error);
            }
            throw error;
        }

        Object.assign(this, data);

        /** Setup Proxy */
        const proxy = new Proxy(this, {
            get: (target, key: PropertyKey, receiver): any => {
                return Reflect.get(target, key, receiver);
            },
            set: (target, key: string, value: any): boolean => {
                const field = _class.field[key] as Field;
                /** Check undefined field with Model()._option.strict */
                if (field === undefined) {
                    if (target._option.strict) {
                        throw new SetValueError(`${target.constructor.name}()["${key}"] is not defined`);
                    } else {
                        target[key] = value;
                        return true;
                    }
                }
                /** Validate value => Throw FieldValidateError is invalid */
                try {
                    value = field.validate(value);
                } catch (error) {
                    if (error instanceof FieldValidateError) {
                        throw new SetValueError(`\`[${key}] = ${value}\` is invalid`);
                    }
                    throw error;
                }
                return Reflect.set(target, key, value);
            },
            deleteProperty: (target, key): boolean => {
                const _class = target.constructor as typeof Model;
                const field = _class.field[key] as Field;
                if (field) { field.validate(undefined) };
                return Reflect.deleteProperty(target, key);
            },
            ownKeys(target) {
                /** Remove protected _option */
                return Object.keys(target)
                    .filter(item => item != '_option');
            }
        });

        return proxy;
    }

    /** Return a new native object with same data */
    object(): Object {
        return JSON.parse(JSON.stringify(this));
    }

    /** Return JSON */
    json(): string {
        return JSON.stringify(this);
    }

    update(data: Object): void {
        const class_ = this.constructor as typeof Model;
        try {
            new class_({ ...this.object(), ...data });
        } catch (error) {
            if (error instanceof ModelError) {
                throw new UpdateError().setError(error.error);
            }
        }
        for (const key in data) {
            this[key] = data[key];
        }
    }
}