class UNDEF {};

interface FieldOption {
    required?: boolean;
    default?: any;
    grant?: any[];
}

const function_chain = (
        target: any,
        memberName: string,
        propertyDescriptor: PropertyDescriptor): any => {
    return {
        get() {
            const func = (...args: any[]) => {
                // Make sure default value does not conflict with this func.
                // To add later.

                // Add decorated function to function chain.
                this._function_chain.push(
                    () => { propertyDescriptor.value.apply(this, args)}
                )
            }
            return func;
        }
    }
}

export class Field {
    option: FieldOption;
    _value: any;
    _function_chain: Array<Function> = [];

    constructor(option: FieldOption = {
        required: true,
        default: new UNDEF(),
        grant: []
    }) {
        this.option = option;
        this._value = option.default;
    }

    default() {
        if (this.option.default instanceof Function) {
            return this.option.default();
        } else {
            return this.option.default;
        }
    }

    @function_chain
    instance(value, type) {
        // When type is Class.
        if (typeof(type) === 'function') {
            console.assert(value instanceof type);
        }
        // When type is primative.
        if (typeof(type) === 'string') {
            console.assert(typeof(value) === type);
        }
    }
};

export class Model extends Map {
    constructor(data: Object) {
        super();
        if (data instanceof Array) {
            throw new Error("data can't be an instance of Array");
        }
        if (!(data instanceof Object)) {
            throw new Error("data must be an instance of Object");
        }
        for (let key in data) {
            this.set(key, data[key]);
        }
    }

    get(key: any) {
        return super.get(key);
    }

    set(key: any, value: any): this {
        super.set(key, value);
        return this;
    }
    

    to_json() {
        let json = {};
        for (let [key, value] of this) {
            if (value instanceof Map) {
            }
            json[key] = value
        }
        return json;
    }
    to_string() {
        return JSON.stringify(this.to_json());
    }
}