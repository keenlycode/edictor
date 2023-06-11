import { Field, DefineField, FieldError } from './field';

class ModelError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'ModelError';
    }
}

export class DefineError extends ModelError {
    constructor(message='') {
        super(message);
        this.name = 'DefineError';
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
    static _definedClass = 'Model';
    static _option: ModelOption = {strict: true};

    static define(model: Object = {}, option: ModelOption = {}): typeof Model {
        if (this._definedClass === this.name) {
            throw new DefineError(`${this} has been defined.`);
        }
        const superClass = Object.getPrototypeOf(this);
        this._option = {...superClass._option, ...option};
        this._define = {...superClass._define};

        if (superClass.name === '') {
            throw new DefineError(`Model.define() is prohibited. `
            + `It must be called from a subclass`);
        }

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

    static _traverse_error_to_string(error) {
        for (const [key, value] of Object.entries(error)) {
            if (value instanceof Error) {
                error[key] = `${value.name}: ${value.message}`
                continue;
            }
            if (value instanceof Object) {
                error[key] = this._traverse_error_to_string(error[key])
            }
        }
        return error;
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

    static partial(data: Object, option: ModelOption = {}): ModelTestResult {
        this._check_input_data(data);

        /** Isolate received data */
        data = {...data};
        option = {...this._option, ...option};
        const result: ModelTestResult = {
            valid: {},
            invalid: {},
            error: {}
        };

        /** Iterate input data object to test */
        for ( const [key, value] of Object.entries(data) ) {
            if (!(key in this.field)) {
                if (option.strict === true) {
                    result["invalid"][key] = value;
                    result["error"][key] = new UndefinedError(`Field is undefined.`)
                } else {
                    result["valid"][key] = value;
                }
                continue;
            }
            try {
                result["valid"][key] = this.field[key].validate(value);
            } catch (error) {
                result["invalid"][key] = value;
                result["error"][key] = error;
            }
        }
        if (Object.keys(result['error']).length > 0) {
            result['errorMessage'] = 'Partial testing contains errors.';
        }
        return result;
    }

    static test(data: Object, option: ModelOption = {}): ModelTestResult {
        this._check_input_data(data);

        /** Isolate received data */
        data = {...data};
        option = {...this._option, ...option};
        const modelTestResult: ModelTestResult = {
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
                    modelTestResult["valid"][key] = this.field[key].option.initial;
                    continue;
                }
            }
            const result = this.field[key].test(value);
            if ('value' in result) {
                modelTestResult['valid'][key] = result['value'];
            }
            if ('errors' in result) {
                modelTestResult['invalid'][key] = value;
                const fieldError = new FieldError();
                fieldError.message = fieldError.errors_to_message(result['errors']);
                modelTestResult['error'][key] = fieldError;
            }
            // try {
            //     result["valid"][key] = this.field[key].validate(value);
            // } catch (error) {
            //     result["invalid"][key] = value;
            //     result["error"][key] = error;
            // }
        }

        /** If option {strict: true}, add errors as undefined fields */
        if (option.strict === true) {
            for (const key of Object.keys(data)) {
                modelTestResult["invalid"][key] = data[key];
                modelTestResult["error"][key] = new UndefinedError(`Field is undefined.`);
            }
        } else { /** If option {strict: false}, add all data left */
            Object.assign(modelTestResult['valid'], data);
        }

        if (Object.keys(modelTestResult['error']).length > 0) {
            modelTestResult['errorMessage'] = 'Testing contains errors.';
        }

        return modelTestResult;
    }

    static validate(data: Object, option: ModelOption = {}): Object {
        let result = this.test(data, option);
        result['error'] = this._traverse_error_to_string(result['error']);

        if (result['errorMessage'] !== undefined) {
            result["errorMessage"] = `${this}.validate() throws errors.`
            throw new ValidateError(JSON.stringify(result));
        }
        return result["valid"];
    }

    protected _option: ModelOption;

    constructor(data: Object = {}, option: ModelOption = {}) {
        const _class = this.constructor as typeof Model;
        option = {..._class._option, ...option};
        this._option = option;

        try {
            data = _class.validate(data, option);
        } catch (error) {
            if (error.name === "InputDataError") {
                throw error;
            }
            const result = JSON.parse(error.message);
            result["errorMessage"] = `new ${this}() throws errors.`
            throw new InitError(JSON.stringify(result));
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
                /** Validate value => Throw FieldError is invalid */
                value = field.validate(value);
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
            const validationResult = JSON.parse(error.message);
            validationResult["errorMessage"] = `${this.constructor.name}().update(data)\n throw errors`;
            throw new UpdateError(JSON.stringify(validationResult));
        }
        for (const key in data) {
            this[key] = data[key];
        }
    }
}