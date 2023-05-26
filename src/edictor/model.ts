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

export class InputDataError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'InputDataError';
    }
}

export class CallError extends Error {
    constructor(message='') {
        super(message);
        this.name = 'CallError';
    }
}

interface ModelOption {
    strict?: boolean
}


export class Model {
    protected static _define = {};
    static _option: ModelOption = {strict: true};

    static define(model: Object = {}, option: ModelOption = {}) {
        const superClass = Object.getPrototypeOf(this);
        this._option = {...superClass._option, ...option};
        this._define = {...superClass._define};

        if (superClass.name === '') {
            throw new CallError(`Model.define() is prohibited. `
            + `It must be called from a subclass`);
        }

        const result = {
            valid: {},
            invalid: {},
            error: {},
            errorMessage: ''
        };

        for (let [key, defineField] of Object.entries(model)) {

            /** Get Field() instance if value is DefineField() */
            let field: Field;

            if (defineField instanceof DefineField) {
                field = defineField.field();
                if (field.name === undefined) { field.name = key };
                result["valid"][key] = true;
            } else {
                result["error"][key] = 'Assigned value is not an instance of DefineField'
                continue;
            }
            if (field.option.initial !== undefined) {
                try {
                    field.validate(field.option.initial);
                    result["valid"][key] = true;
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
    }

    static get field() {
        return {...this._define};
    }

    static test(data: Object = {}, option: ModelOption = {}): Object {
        if (data instanceof Array) {
            throw new InputDataError(`new ${this.constructor.name}(data) => `
            + `data must be an instance of object. Received Array`);
        }
        if (!(data instanceof Object)) {
            throw new InputDataError(`new ${this.constructor.name}(data) => `
            + `data must be an instance of object, Received ${typeof(data)}`);
        }

        /** Isolate recevied data */
        data = {...data};
        option = {...this._option, ...option};
        const result = {
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
                result["valid"][key] = this.field[key].option.initial;
                continue;
            }
            try {
                result["valid"][key] = this.field[key].validate(value);
            } catch (e) {
                result["invalid"][key] = value;
                result["error"][key] = e.message;
            }
        }

         /** If there's no data left, return void */
        if (Object.keys(data).length === 0) {
            return result;
        }

        /** Program reach here if there's some data left */

        /** If option {strict: true}, add more errors for undefined fields */
        if (option.strict) {
            for (const key of Object.keys(data)) {
                result["invalid"][key] = data[key];
                result["error"][key] = undefined;
            }
        } else {
            Object.assign(result['valid'], data);
        }
        return result;
    }

    protected _option: ModelOption;

    constructor(data: Object = {}, option: ModelOption = {}) {
        const _class = this.constructor as typeof Model;
        this._option = {..._class._option, ...option};

        let result = _class.test(data, option);
        if (Object.keys(result["error"]).length > 0) {
            result["errorMessage"] = `new ${_class.name}() throws errors.`
            throw new InitError(JSON.stringify(result));
        }

        Object.assign(this, result["valid"]);

        /** Setup Proxy */
        const proxy = new Proxy(this, {
            get: (target, key: PropertyKey, receiver): any => {
                return Reflect.get(target, key, receiver);
            },
            set: (target, key: string, value: any): boolean => {
                const field = _class.field[key] as Field;
                /** Check undefined field with Model._option.strict */
                if (field === undefined) {
                    if (target._option.strict) {
                        throw new FieldError(`${target.constructor.name}()["${key}"] is not defined`);
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