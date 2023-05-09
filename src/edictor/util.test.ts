import { expect, test } from '@jest/globals';
import { is_function, is_class } from './util';

const func_1 = (a, b) => { return };
const func_2 = a => { return };
function func_3(a,b,c) { return };

class A {};

test('is_function', () => {
    expect(is_function(func_1)).toBeTruthy();
    expect(is_function(func_2)).toBeTruthy();
    expect(is_function(func_3)).toBeTruthy();
    expect(is_function(A)).toBeFalsy();
    expect(is_function('(a,b) => { return }')).toBeFalsy();
})

test('is_class', () => {
    expect(is_class(A)).toBeTruthy();
    expect(is_class(func_1)).toBeFalsy();
    expect(is_class('class A {};')).toBeFalsy();
})