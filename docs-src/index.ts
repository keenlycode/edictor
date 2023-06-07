import { Model, defineField, ArrayOf } from 'edictor';
import './index.style';

window.Model = Model;
window.ArrayOf = ArrayOf;
window.defineField = defineField;

window.addEventListener('load', () => {
    window.sidebar.showAt = null;
    setTimeout(() => {
        window.sidebar.hide();
    }, 500);
})