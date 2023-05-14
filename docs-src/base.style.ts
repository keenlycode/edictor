import {
    bgColor,
    addStyle as css,
    fontFluid
} from "gadjet/src/gadjet";

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
    padding: 1.5rem 1rem;
}

code {
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    font-size: 0.8rem;
    border-radius: 0.4rem;
    vertical-align: text-bottom;
    ${bgColor('#3d3846')}
}

div.p, p {
    max-width: 45rem;
    width: 100%;
}

el-icon {
    fill: currentColor;
}

.container {
    width: 90%;
    max-width: 1000px;
    min-width: 300px;
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
}
`