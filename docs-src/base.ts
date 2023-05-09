import { addStyle, bgColor } from 'gadjet/src/gadjet';

let _src = document.currentScript.src;
_src = new URL(_src);

const css = addStyle;

css`
@font-face {
    font-family: sans;
    src: url(${_src}/asset/font/NotoSansThaiLooped-Regular.ttf);
}
@font-face {
    font-family: monospace;
    src: url(${_src}/asset/font/FiraCode-VariableFont_wght.ttf);
}

html {
    font-family: sans;
}

body {
    margin: 0;
    padding: 0;
}

pre {
    width: 100%;
    max-width: 45rem;
}

#header {
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    min-height: 90vh;
    h1 {
        margin: 0;
    }
}
`