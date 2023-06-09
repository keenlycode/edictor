import {
    bgColor,
    addStyle as css,
    fontFluid
} from "gadjet/src/gadjet";

import Color from 'color';

import { theme, palette } from './_color';

let _base_url = document.currentScript.src;
_base_url = new URL('./', _base_url).toString();

css`
@font-face {
    font-family: sans;
    src: url(${_base_url}asset/font/NotoSansThaiLooped-Regular.ttf);
}
@font-face {
    font-family: monospace;
    src: url(${_base_url}asset/font/FiraCode-VariableFont_wght.ttf);
}

html {
    font-family: sans;
    line-height: 1.7;
    ${fontFluid({
        fontSizeMax: 20,
        fontSizeMin: 14,
        vwMax: 1000,
        vwMin: 300
    })}
}

body {
    margin: 0;
    padding: 0;
}

img {
    width: 100%;
}

pre {
    width: 100%;
    max-width: 45rem;
    margin: auto;
}

pre > code.hljs {
    box-sizing: border-box;
    width: 100%;
    max-width: 45rem;
    font-size: 0.8rem;
    margin: auto;
    padding: 1rem 1rem;
    border-top-left-radius: 0;
    border-left: 0.3rem solid ${theme.yellow};
}

p + pre {
    margin-top: -0.5rem;
}

code {
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    font-size: 0.8rem;
    border-radius: 0.4rem;
    vertical-align: text-bottom;
    ${bgColor(new Color(theme.purple2).lighten(0.3).toString())}
}

video {
    display: block;
    width: 100%;
}

div.p, p {
    max-width: 45rem;
    width: 100%;
    margin: auto;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}

el-icon {
    fill: currentColor;
}

h3 {
    margin-bottom: 0;
}

p + blockquote {
    margin-top: -0.5rem;
}

blockquote {
    margin: 0;
    padding-left: 1rem;
    border-left: 0.4rem solid ${theme.purple3};
    border-radius: 1rem;
    border-top-left-radius: 0;
    box-sizing: border-box;
    ${bgColor(new Color(theme.purple3).lighten(0.5).toString())}
    ul {
        padding-left: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        margin: 0;
    }
}

.container {
    width: 90%;
    max-width: 1000px;
    min-width: 300px;
    margin: auto;
}

.block-text {
    max-width: 45rem;
    min-width: 300px;
    width: 100%;
    margin: auto;
}

.flex {
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
}

.flex-center {
    justify-content: center;
}

.width-100 {
    width: 100%;
    box-sizing: border-box;
}

.width-50 {
    width: 50%;
    box-sizing: border-box;
}
`