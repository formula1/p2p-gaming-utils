import {
  CHROME_VALUES
} from "./chrome";
import {
  FIREFOX_VALUES
} from "./firefox";
import {
  SHARED_BROWSER_VALUES
} from "./shared";


export const BROWSER_VALUES = (
  SHARED_BROWSER_VALUES
).concat(
  FIREFOX_VALUES
).concat(
  CHROME_VALUES
);
