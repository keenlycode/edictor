import {
    addStyle as css,
    bgColor
} from "gadjet/src/style";
import Color from 'color';
import { theme } from '../_color';

css`
body {
    ${bgColor(new Color(theme.yellow).lighten(0.2).toString())}
}

#guide {
    max-width: 850px;
    @media screen and (min-width: 1170px) {
        margin-left: 330px;
    }
    @media screen and (min-width: 1500px) {
        margin: auto;
    }
    @media screen and (max-width: 600px) {
        padding-top: 3rem;
    }
    h1 {
        margin: auto;
        text-align: center;
        a {
            color: ${theme.purple2};
            text-decoration: none;
        }
    }
    h2 {
        color: ${theme.purple2};
        border-bottom: 2px dashed ${theme.purple2};
    }

    .link-padding-top {
        padding-top: 4rem;
    }
}
`