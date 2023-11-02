import Color from 'color';
import { Sidebar, aspectRatio, bgColor, bgColorInt, lift } from 'gadjet/src/gadjet';
import { Menu as SidebarMenu, ButtonPin as SidebarButton } from 'gadjet/src/gadjet';
import { theme } from '../../_color';

SidebarButton.define('el-sidebar-button');
SidebarButton.tagStyle({
    color: theme.purple2
})
SidebarButton.tagStyle(`
    position: fixed;
    top: 1.5rem;
    left: 1.5rem;
    font-size: 1.5rem;
    z-index: 100;
`)

SidebarMenu.define('el-sidebar-menu');
SidebarMenu.tagStyle({
    bgColor: theme.purple3,
})
SidebarMenu.tagStyle(`
    border-radius: 0;
    border: 0;
    padding-bottom: 5rem;
    font-size: 0.85rem;
    a {
        ${bgColorInt({
            color: new Color(theme.purple3).lighten(0.5).toString(),
            lighten: -0.2
        })}
        text-decoration: none;
    }
`)

Sidebar.define('el-sidebar');
Sidebar.tagStyle({
    bgColor: new Color(theme.purple3).lighten(0.5).toString(),
    overlayColor: new Color(theme.purple3).darken(0.8).fade(0.2).toString()
});

Sidebar.tagStyle(`
    div[el="header"] {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        ${aspectRatio("3/2")}
        ${bgColor(new Color(theme.purple2).lighten(0.2).toString())}
        a {
            color: inherit;
            text-decoration: none;
        }
        h2 {
            display: block;
            margin: auto;
            text-align: center;
        }
        el-icon {
            font-size: 3em;
        }
    }
    div[el="content"] {
        width: 90%;
        max-width: 300px;
        height: auto;
        max-height: 100vh;
        border-bottom-right-radius: 1em;
        ${lift({level: 3})}
    }
`)

window.sidebar = document.querySelector('el-sidebar');

document.querySelector(SidebarButton.tagName).addEventListener('click', () => {
    window.sidebar.show();
})

document.querySelector(`el-sidebar-menu`)
.addEventListener('click', (event) => {
    if (window.matchMedia("(min-width: 1190px").matches) {
        console.log('matched')
        return;
    }
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === "a") {
        setTimeout(() => {
            window.sidebar.hide();
        }, 250);
    }
})