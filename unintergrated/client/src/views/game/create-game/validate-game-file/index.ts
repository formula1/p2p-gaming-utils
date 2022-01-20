import {
  validateFiles,
  resolveAllFilesFromFolder
} from "./files";

import { validateGameJson } from "./validate-game-json"
import { validateGameJs } from "./validate-game-js"

export async function validateGameFile(file: ArrayBuffer){
  var {
    json,
    js,
    filesFolder,
  } = await validateFiles(file)

  const [
    files,
    gameJsText,
    gameJsonText
  ] = await Promise.all([
    await resolveAllFilesFromFolder(filesFolder),
    js.async("string"),
    json.async("string"),
  ])

  const getFile = function(location: string){
    return files[location]
  }

  await Promise.all([
    validateGameJson(gameJsonText)
  ])

}
