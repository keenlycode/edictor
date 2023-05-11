import { addStyle as css } from "gadjet/src/gadjet";

css`
body {
    color: #f6f5f4;
    background: #241f31;
}
#header {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    width: 100%;
    overflow-x: hidden;
    background-color: black;
    color: white;
    div[el="left"] {
        width: 40%;
        min-width: 300px;
        align-content: center;
        justify-content: center;
        img {
            width: 150%;
            max-width: 35em;
            object-fit: cover;
        }
        @media screen and (max-width: 600px) {
            img {
                margin-top: -2em;
            }
        }
    }
    div[el="right"] {
        width: 60%;
        min-width: 300px;
        align-content: center;
        z-index: 1;
        h1, h2 {
            text-align: center;
        }
        @media screen and (max-width: 600px) {
            h1 {
                margin-top: -0.5em;
            }
            h2 {
                margin-top: 0;
            }
        }
    }
    button {
        margin: 0.5rem;
        margin-top: 2rem;
    }
}
.view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    height: auto;
    h2 {
        text-align: center;
        width: 100%;
    }
}

#define {
    background: rgb(0,0,0);
    background: linear-gradient(180deg, rgba(0,0,0,1) 0%, #241f31 80%);
}

#try {
    .container {
        justify-content: center;
    }
    strong {
        display: block;
        text-align: center;
    }
}
`