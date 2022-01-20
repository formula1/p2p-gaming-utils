import  JSZip from "jszip";

type ValidateFilesReturn = {
  json: JSZip.JSZipObject,
  js: JSZip.JSZipObject,
  filesFolder: JSZip
}
export async function validateFiles(arrayBuffer: ArrayBuffer): Promise<ValidateFilesReturn>{
  const jsZip = await JSZip.loadAsync(arrayBuffer)


  console.log(jsZip.files);
  const gameJsonFile = jsZip.file("/game.json");
  if(!gameJsonFile){
    throw new Error("game.json does not exist")
  }
  if(gameJsonFile.dir){
    throw new Error("game.json is a folder")
  }

  const gameJsFile = jsZip.file("/game.js")
  if(!gameJsFile){
    throw new Error("game.js does not exist")
  }
  if(gameJsFile.dir){
    throw new Error("game.js is a folder")
  }

  const filesFolderFile = jsZip.file("/files")
  if(!filesFolderFile){
    throw new Error("files folder does not exist")
  }
  if(!filesFolderFile.dir){
    throw new Error("files is not a folder")
  }

  const filesFolder = jsZip.folder("/files");




  return {
    json: gameJsonFile,
    js: gameJsFile,
    filesFolder: filesFolder
  }
}

export function resolveAllFilesFromFolder(folder: JSZip){
  var promises: Array<Promise<any>> = [];
  var files: { [key: string]: Uint8Array} = {};

  folder.forEach((relativePath, file)=>{
    if(file.dir) return;
    promises.push(
      file.async("uint8array").then((u8)=>{
        files[relativePath] = u8
      })
    )
  })

  return Promise.all(promises).then(()=>{
    return files
  });
}
