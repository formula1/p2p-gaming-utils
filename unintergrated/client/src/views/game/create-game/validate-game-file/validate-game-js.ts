
/*

I need the function to return
- run script should
  - set initialize
  - set runFrame
- initialize
  - will be run async
- run frame

*/


import {
  parseScript
} from "esprima";

import {
  Script, createContext
} from "vm";

export async function validateGameJs(
  str: string,
  getFile: (fileLocation: string)=>ArrayBuffer
){
  "use strict";

  var strictStr = "'use strict';" + str;

  var program = parseScript(strictStr, { jsx: false });
  const div = document.createElement("div");
  var script = new Script(strictStr);
  var context = createContext({
    div: div, getFile: getFile
  })

  var { initialize, runFrame } = script.runInContext(context)

  await initialize();


}
