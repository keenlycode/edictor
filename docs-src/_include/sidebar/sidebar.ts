import * as Color from 'color';
import { Sidebar, aspectRatio, bgColor } from 'gadjet/src/gadjet';
import { Menu } from 'gadjet/src/gadjet';
import {theme} from '../../_color';

Menu.define('el-menu');
Menu.tagStyle({
    hoverColor: theme.purple3,
    arrowColor: theme.purple2
});
Menu.tagStyle(`
    border-radius: 0;
    border-color: ${theme.purple1};
    a {
        color: black;
        padding-left: 0.8rem;
    }
`)

Sidebar.define('el-sidebar');
Sidebar.tagStyle({
    bgColor: Color(theme.purple3).lighten(0.5),
    overlayColor: 'rgba(0,0,0,0.7)'
});

Sidebar.tagStyle(`
    div[el="content"] {
        width: 280px;
        height: auto;
    }
    div[el="header"] {
        ${aspectRatio("3/2")}
        ${bgColor(Color(theme.purple2).lighten(0.2))}
        h2 {
            display: block;
            margin: auto;
            text-align: center;
        }
        el-icon {
            font-size: 3em;
        }
    }
    div[el="menu"] {
        a {
            color: inherit;
        }
    }
`)

window.sidebar = document.querySelector('el-sidebar');