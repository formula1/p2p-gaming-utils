import {
  BROWSER_LISTENERS
} from "./listeners";
import {
  BROWSER_METHODS
} from "./methods";
import {
  BROWSER_VALUES
} from "./values";

export const BROWSER_GLOBALS = (
  BROWSER_LISTENERS
).concat(
  BROWSER_METHODS
).concat(
  BROWSER_VALUES
);
