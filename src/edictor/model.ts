import { Field, DefineField, defineField } from './field';
export { Field, DefineField, defineField };


export class ModelError extends Error {
    name: string;
    message: string;
    constructor(message='') {
        super(message);
        this.name = this.constructor.name;
    }
};

export class DefineError extends Error {
    name: string;
    message: string;
    constructor(message='') {
        super(message);
        this.name = this.constructor.name;
    }
};

interface ModelOption {
    strict?: boolean
}

export class Model {
    static _define = {};
    static _option: ModelOption = {strict: true};

    static define(model: Object = {}, option: ModelOption = {}) {
        if (this.name === 'Model') {
            throw new DefineError(
                `Model.define() is prohibited. `
                + `It must be called from a subclass`
            )
        }
        const superClass = Object.getPrototypeOf(this);
        this._option = {...superClass._option, ...option};
        this._define = {...superClass._define};
        const errors = [];
        for (let [key, defineField] of Object.entries(model)) {

            /** Get Field() instance if value is DefineField() */
            let field: Field;

            if (defineField instanceof DefineField) {
                field = defineField.field();
                if (field.name === undefined) { field.name = key };
            } else {
                errors.push(`\n- [${key}]: value is not an instance of DefineField`)
            }

            model[key] = field;
        }
        if (errors.length > 0) {
            throw new DefineError(`${errors}`);
        }
        this._define = model;
    }

    protected _option: ModelOption;

    constructor(data: Object = {}, option: ModelOption = {}) {
        if (data instanceof Array) {
            throw new ModelError(`new ${this.constructor.name}() initial data`
            + ` must be instance of object. Received Array`);
        }

        if (!(data instanceof Object)) {
            throw new ModelError(`new ${this.constructor.name}() initial data`
            + ` must be an instance of object, Received ${typeof(data)}`);
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
                /** Check undefined value with Model._option.strict */
                if (field === undefined) {
                    if (this._option.strict) {
                        throw new ModelError(`["${key}"] is not defined`)
                    } else {
                        target[key] = value;
                        return true;
                    }
                }
                /** Validate value */
                try { value = field.validate(value) } catch (e) {
                    throw new ModelError(`["${key}"] => ${e}`)
                };
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
            try {
                proxy[key] = data[key];
            } catch (e) {
                errors.push(e.message);
            }
            delete data[key];
        }

        if (errors.length > 0) {
            let msg = ``;
            for (const error of errors) {
                msg += `\n- ${error}`
            }
            throw new ModelError(msg);
        }

         /** If there's no data left, return proxy */
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return proxy;
        }

        /** Program reach here if there's some data left */

        /** If Model is stricted, throw ModelError */
        if (this._option.strict) {
            throw new ModelError(`Data keys [${keys}] exeeds defined fields`)
        }

        /** Model is not stricted. Assign data to Model() */
        Object.assign(proxy, data);
        return proxy;
    }

    /** Return a new native object with same data */
    object(): Object {
        return {...this};
    }
}