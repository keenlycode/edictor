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