import { Field } from 'patternic/src/patternic';

let name = new Field().instance('string');
name._value = 'user';
name._validate();