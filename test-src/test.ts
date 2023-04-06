import { Field, ListOf, assertClass, assertFunction } from 'patternic/src/field';

class A {};
assertClass(A);
const a = 'hi';
assertFunction(a);