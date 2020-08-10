import {
  CHROME_METHODS
} from "./chrome";
import {
  FIREFOX_METHODS
} from "./firefox";
import {
  SHARED_BROWSER_METHODS
} from "./shared";


export const BROWSER_METHODS = (
  SHARED_BROWSER_METHODS
).concat(
  FIREFOX_METHODS
).concat(
  CHROME_METHODS
);
