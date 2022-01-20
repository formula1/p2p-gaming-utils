
/*

- download game
- unzip the game
- turn all files in "/files" into buffers
  - create a file
- eval the .js file
- initialize game with the files


*/

export const setupFilesFn = `
async function setupFiles(gameFileId){

  const response = await fetch("/game/file/" + gameFileId)
  const buffer = await response.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer);

  const files = {};

  const filePromises = [];

  zip.folder("files").forEach((relativePath, file) => {
    filePromises.push(
      file.async("uint8array").then((u8)=>{
        files[relativePath] = u8;
      })
    )
  });

  const [jsFile] = await Promise.all([
    zip.file("/index.js").async("string")
    Promise.all(filePromises);
  ])

  const getFile = function(filePath){
    return files[filePath]
  }

  return {
    jsFile, files, getFile
  }
}`;
