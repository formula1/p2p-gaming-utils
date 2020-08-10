import {
  BROWSER_GLOBALS
} from "./browser";

import {
  NODE_GLOBALS
} from "./node";

import {
  SHARED_GLOBALS
} from "./shared";

export const GLOBALS = [].concat(
  BROWSER_GLOBALS
).concat(
  NODE_GLOBALS
).concat(
  SHARED_GLOBALS
)
