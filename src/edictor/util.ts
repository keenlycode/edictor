/** Utility function to check if instance is a Function */
export function is_function(instance) {
    if (!(instance instanceof Function)) {
        return false;
    }
    const str = instance.toString();
    if (str.match(/^function/)) {
        return true;
    }
    if (str.match(/^\([\w\s,]*\)\s*\=\>\s*\{.*};?$/s)) {
        return true;
    }
    if (str.match(/^[\w\s]*\s*\=\>\s*\{.*};?$/s)) {
        return true;
    }
    return false;
}

/** Utility function to check if instance is a Class */
export function is_class(instance) {
    if (!(instance instanceof Function)) {
        return false;
    }
    if (instance.toString().match(/^class/)
    ) {
        return true;
    }
    return false;
}

export class AssertError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export const assert = (exp: boolean, message: string = null) => {
    if (message === null) {
        message = `Expected assert(expression) to be true.`
    }
    if (exp === false) {
        throw new AssertError(message);
    }
}