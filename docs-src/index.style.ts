import { addStyle as css } from "gadjet/src/gadjet";

css`
#header {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    h1 {
        margin-top: -4rem;
    }
    h1, h2 {
        text-align: center;
    }
}
.view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    h2 {
        text-align: center;
        width: 100%;
    }
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