import { Field } from '@nitipit/patternic/src/patternic';

let name = new Field();

name.instance('a', 'string');

console.log(name._function_chain[0]());