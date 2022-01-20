import mongoose, { Mongoose } from 'mongoose';
import { MONGO_URL } from "../constants/mongodb";
// const mongoose = new Mongoose();

mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

function waitForMongoose(): Promise<Mongoose>{
  return new Promise((res, rej)=>{
    const db = mongoose.connection
    switch(mongoose.connection.readyState){
      case 1: return res(mongoose);
      case 0: return rej("Mongooose Disconnnected")
    }

    var oLis: (value: any)=>any;
    var eLis: (error: any)=>any;
    db.once("open", oLis = (value)=>{
      console.log("open");
      db.removeListener("error", eLis);
      res(value);
    })
    db.once("error", eLis = (err)=>{
      console.error("error");
      db.removeListener("open", oLis);
      rej(err);
    })
  })
}

export {
  waitForMongoose,
  mongoose
}
