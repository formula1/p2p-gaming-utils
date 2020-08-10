import {
  CHROME_LISTENERS
} from "./chrome";
import {
  FIREFOX_LISTENERS
} from "./firefox";
import {
  SHARED_BROWSER_LISTENERS
} from "./shared";


export const BROWSER_LISTENERS = (
  SHARED_BROWSER_LISTENERS
).concat(
  FIREFOX_LISTENERS
).concat(
  CHROME_LISTENERS
);
