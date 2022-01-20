import React, { useState } from "react";
import { handleSubmit } from "./handle-submit";
import { validateGameFile } from "./validate-game-file";

import {
  useNavigate
} from "react-router-dom";


import {
  useAuth
} from "../../../context/user";


export function CreateGame(){
  const auth = useAuth();
  const navigate = useNavigate()

  const [createError, setCreateError] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameFile, setGameFile] = useState(null);

  return (
    <form
      onSubmit={async (e)=>{
        e.preventDefault();
        try {
          if(gameFile === null){
            throw "No file chosen"
          }
          const result = await handleSubmit(auth, {
            gameName,
            gameFile
          })
          console.log(result)
          navigate("/game-lobby/" + result._id)
        }catch(e){
          console.error("submit error:", e);
          setCreateError(e.message || e);
        }
      }}
    >
      <div>
        {createError}
      </div>
      <div>
        <span>Game Name:</span>
        <input
          name="gameName"
          type="text"
          value={gameName}
          onChange={(e)=>{
            setGameName(e.target.value)
          }}
        />
      </div>

      <div>
        <span>Game File:</span>
        <input
          name="gameFile"
          type="file"
          accept=".zip"
          onChange={async (e)=>{
            const target = e.target;
            try {
              const file = target.files[0];
              const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
                let reader = new FileReader()
                reader.addEventListener("loadend", e => resolve(e.target.result as ArrayBuffer))
                reader.addEventListener("error", reject)
                reader.readAsArrayBuffer(file)
              })
              await validateGameFile(arrayBuffer);
              setGameFile(file);
            }catch(e){
              console.error(e);
              target.value = null;
              throw e;
            }
          }}
        />
      </div>

      {

      }

      <div>
        <button type="submit">Create Game</button>
      </div>
    </form>
  );
}
