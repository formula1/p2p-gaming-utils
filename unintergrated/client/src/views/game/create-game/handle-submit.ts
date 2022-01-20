
import {
  IAuthState
} from "../../../utils/auth-state"

type HandleSubmitProps = {
  gameName: string,
  gameFile: File
}

export async function handleSubmit(auth: IAuthState, {
  gameName,
  gameFile
}: HandleSubmitProps){
  var formdata = new FormData();
  formdata.append("gameName", gameName)
  formdata.append("gameFile", gameFile)

  const response = await auth.fetch(
    "/game/create",
    {
      method: "POST",
      body: formdata,
      headers: {
        "Access-Control-Allow-Origin": "*",
        // "Content-Type": "multipart/form-data"
      }
    }
  );

  const json = await response.json()

  if(!response.ok){
    throw json.message
  }

  return json;

}
