import GridFs, { Grid} from 'gridfs-stream';

import {
  mongoose,
  waitForMongoose
} from "./mongoose";

import {
  waitorResolve
} from "./Promise"

console.log("creating gridfs");

const waitForGridFs = waitorResolve(
  waitForMongoose().then(()=>{
    return GridFs(
      mongoose.connection.db,
      mongoose.mongo
    )
  })
) as ()=>Promise<Grid>

waitForGridFs().then((gridFs)=>{
  console.log("resolved gridfs")
  return gridFs
}, (err)=>{
  console.error("error with gridfs:", err);
  throw err
})


export { waitForGridFs }
