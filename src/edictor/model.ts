import { Field, DefineField, defineField } from './field';
export { Field, DefineField, defineField };


export class ModelError extends Error {
    name: string;
    message: string;
    constructor(message='') {
        super(message);
        this.name = 'ModelError';
    }
};

export class DefineError extends Error {
    name: string;
    message: string;
    constructor(message='') {
        super(message);
        this.name = 'DefineError';
    }
};

export class UpdateError extends Error {
    name: string;
    message: string;
    constructor(message='') {
        super(message);
        this.name = 'UpdateError';
    }
};

interface ModelOption {
    strict?: boolean
}


export class Model {
    static _define = {};
    static _option: ModelOption = {strict: true};

    static define(model: Object = {}, option: ModelOption = {}) {
        const superClass = Object.getPrototypeOf(this);
        this._option = {...superClass._option, ...option};
        this._define = {...superClass._define};
        const errors = [];

        if (superClass.name === '') {
            throw new DefineError(
                `Model.define() is prohibited. `
                + `It must be called from a subclass`
            )
        }

        for (let [key, defineField] of Object.entries(model)) {

            /** Get Field() instance if value is DefineField() */
            let field: Field;

            if (defineField instanceof DefineField) {
                field = defineField.field();
                if (field.name === undefined) { field.name = key };
            } else {
                errors.push(`\n- [${key}]: value is not an instance of DefineField`);
                continue;
            }
            if (field.option.initial !== undefined) {
                try {
                    field.validate(field.option.initial);
                } catch (e) {
                    errors.push(
                        `\n- Field({initial: ${field.option.initial}})`
                        + ` conflicts with Field's validation => ${e}`
                    );
                }
            }

            model[key] = field;
        }
        if (errors.length > 0) {
            throw new DefineError(`${this.name}.define ${errors}`);
        }
        this._define = model;
    }

    static field() {
        return {...this._define};
    }

    protected _option: ModelOption;

    constructor(data: Object = {}, option: ModelOption = {}) {
        if (data instanceof Array) {
            throw new ModelError(`new ${this.constructor.name}(data) => `
            + `data must be instance of object. Received Array`);
        }

        if (!(data instanceof Object)) {
            throw new ModelError(`new ${this.constructor.name}(data) => `
            + `data must be an instance of object, Received ${typeof(data)}`);
        }

        /** Isolate recevied data */
        data = {...data};

        const _class = this.constructor as typeof Model;
        this._option = {..._class._option, ...option};

        /** Setup Proxy */
        const proxy = new Proxy(this, {
            get: (target, key: PropertyKey, receiver): any => {
                return Reflect.get(target, key, receiver);
            },
            set: (target, key: string, value: any): boolean => {
                const field = _class._define[key] as Field;
                /** Check undefined field with Model._option.strict */
                if (field === undefined) {
                    if (this._option.strict) {
                        throw new ModelError(`${this.constructor.name}()["${key}"] is not defined`)
                    } else {
                        target[key] = value;
                        return true;
                    }
                }
                /** Validate value */
                try { value = field.validate(value) } catch (e) {
                    throw new ModelError(`${this.constructor.name}()["${key}"] => ${e}`)
                };
                if (value === undefined) {
                    return Reflect.deleteProperty(target, key);
                }
                return Reflect.set(target, key, value);
            },
            deleteProperty: (target, key): boolean => {
                const _class = target.constructor as typeof Model;
                const field = _class._define[key] as Field;
                if (field) { field.validate(undefined) };
                return Reflect.deleteProperty(target, key);
            },
            ownKeys(target) {
                /** Remove protected _option */
                delete target['_option'];
                return Reflect.ownKeys(target);
            },
        });

        const errors = [];

        /** Iterate defined field to validate and assign data.
         * - Also delete data[key] after assigned.
        */
        for (const key in _class._define) {
            if (data[key] === undefined) {
                proxy[key] = _class._define[key].option.initial;
                continue;
            }
            try {
                proxy[key] = data[key];
            } catch (e) {
                errors.push(e.message);
            }
            delete data[key];
        }

        if (errors.length > 0) {
            let msg: string;
            for (const error of errors) {
                msg += `\n- ${error}`
            }
            throw new ModelError(`new ${this.constructor.name}(data) ${msg}`);
        }

         /** If there's no data left, return proxy */
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return proxy;
        }

        /** Program reach here if there's some data left */

        /** If Model is stricted, throw ModelError */
        if (this._option.strict) {
            throw new ModelError(
                `new ${this.constructor.name}(data):`
                + `\ndata[${keys}] exeeds defined fields`
            )
        }

        /** Model is not stricted. Assign data to Model() */
        Object.assign(proxy, data);
        return proxy;
    }

    /** Return a new native object with same data */
    object(): Object {
        return {...this};
    }

    update(data: Object): void {
        const class_ = this.constructor as typeof Model;
        try {
            new class_({ ...this.object(), ...data });
        } catch (e) {
            throw new UpdateError(
                `${this.constructor.name}().update(data)\n`
                + `${e.message}`
            );
        }
        for (const key in data) {
            this[key] = data[key];
        }
    }
}