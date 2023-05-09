import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-light.css';
import './base.style';


let _src = document.currentScript.src;
_src = new URL(_src);

hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();