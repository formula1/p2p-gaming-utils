import multer from "multer";
import * as path from "path";
import url from 'url';
import {
  GridFsStorage
} from "multer-gridfs-storage"

import { mongoose } from "./mongoose";

const storage = new GridFsStorage({
  db: mongoose.connection,
  file: async (req, file) => {
    console.log("multer file:", file)
    const parsedUrl = url.parse(req.originalUrl);

    console.log("pathname:", parsedUrl.pathname)

    var filename = (
      Math.random().toString(16).substring(2)
      +
      Date.now().toString(16)
      +
      path.extname(file.originalname)
    )

    console.log("fileName:", filename)

    return {
      filename,
      bucketName: parsedUrl.pathname
    }

    // return Promise.reject("Prevent saving file")
  }
});

export const upload = multer({ storage });
