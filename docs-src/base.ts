import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import { Button } from 'gadjet/src/gadjet';
import { Icon } from '@nitipit/icon/src/icon';

import './base.style';


let _base_url: URL = document.currentScript.src;
_base_url = new URL('./', _base_url);

hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();

Icon.href = `${_base_url}asset/icomoon/symbol-defs.svg`;
customElements.define('el-icon', Icon);

Button.define('button');
Button.tagStyle({
    color: '#f5c211'
})
Button.classStyle('gray', {
    color: '#deddda'
})