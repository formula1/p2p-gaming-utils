import {
  PUBLIC_UI_ORIGIN
} from "./location-orgins";

function indexHTML (){
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <link
        rel="stylesheet"
        type="text/css"
        href="${PUBLIC_UI_ORIGIN + "/theme.css"}"
      />
    </head>
    <body>
      <div id="init" ></div>
      <script type="text/javascript" src="${PUBLIC_UI_ORIGIN + "/hidden.build.js"}" ></script>
      <script type="text/javascript">
        require("init").initRun("#init");
      </script>
    </body>
    </html>
  `;
}

export {
  indexHTML
}
