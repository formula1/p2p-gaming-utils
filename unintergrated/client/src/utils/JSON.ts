
type JSONPrimitive = string | number | boolean;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;
type JSONObject = { [member: string]: JSONValue };
interface JSONArray extends Array<JSONValue> {}

export { JSONArray, JSONPrimitive, JSONObject, JSONValue };

export function JSONcopy(value: JSONValue) {
    return JSON.parse(JSON.stringify(value));
};
