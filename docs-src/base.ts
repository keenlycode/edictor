import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import shell from 'highlight.js/lib/languages/shell';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

import { Button, bgColor } from 'gadjet/src/gadjet';
import { ButtonSquare } from 'gadjet/src/gadjet';
import { Icon } from '@nitipit/icon/src/icon';
import './base.style';

import { Adapter } from '@nitipit/adapter/src/adapter'

import { theme } from './_color';

class TitleCode extends Adapter {};
TitleCode.define('el-title-code');
TitleCode.tagStyle(`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 0.1rem 0.5rem 0.3rem 0.5rem;
    box-sizing: border-box;
    line-height: 1.5;
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
    min-width: 2rem;
    font-size: 0.8rem;
    font-weight: bold;
    ${bgColor(theme.yellow)}
`)

class TitleBlockquote extends Adapter {};
TitleBlockquote.define('el-title-blockquote');
TitleBlockquote.tagStyle(`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 0.1rem 0.5rem 0.3rem 0.5rem;
    box-sizing: border-box;
    line-height: 1.5;
    border-top-left-radius: 0.5em;
    border-top-right-radius: 0.5em;
    min-width: 2rem;
    font-size: 0.8rem;
    font-weight: bold;
    ${bgColor(theme.purple3)}
`)


let _base_url:any  = document.currentScript.src;
_base_url = new URL('./', _base_url).toString();

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', html);
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

ButtonSquare.define('el-button-square');