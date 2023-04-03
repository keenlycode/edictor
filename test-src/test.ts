import { Field } from '@nitipit/patternic/src/patternic';

let name = new Field();

name.instance('a', 'b');

console.log(name._function_chain);