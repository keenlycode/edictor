class UNDEF {};

interface FieldOption {
    required?: boolean;
    default?: any;
    grant?: any[];
}

export class Field {
    option: FieldOption;
    _value: any;
    _functions: Array<Function>;

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