import { createBrowserHistory } from "history";

export default createBrowserHistory();

type HistoryMatch = {
  isExact: boolean;
  params: {
    [key: string]: string
  }
​​  path: string,
  url: string
}

export {
  HistoryMatch
}
