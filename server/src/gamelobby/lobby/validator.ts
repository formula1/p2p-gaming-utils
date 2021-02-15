
import {
  TypeOfGameValues,
} from "../../models/GameLobby";


function createValidation(body: any){
  if(!body){
    throw new Error("no body found");
  }

  var name = body.name;
  var minUsers = body.minUsers ? parseInt(body.minUsers) : 2
  var maxUsers = body.maxUsers ? parseInt(body.maxUsers) : 2
  var typeOfGame = body.typeOfGame;
  if(name.length < 7){
    throw new Error("Name of lobby must be at least 7 characters");
  }
  if(name.length > 255){
    throw new Error("Name of lobby can be at max 255 characters");
  }

  if(minUsers < 2){
    throw new Error("Min users must be at least 2");
  }
  if(maxUsers < 2){
    throw new Error("Max users must be at least 2");
  }

  if(minUsers > maxUsers){
    throw new Error("Min users is greater than maxUsers");
  }

  if(!TypeOfGameValues.some((typeOfGameValue)=>{
    return typeOfGameValue === typeOfGame
  })){
    throw new Error(
      "Type of Game can only be one of the following: " + JSON.stringify(TypeOfGameValues)
    )
  }

  return {
    name: name,
    minUsers: minUsers,
    maxUsers: maxUsers,
    typeOfGame: typeOfGame
  }

}

export {
  createValidation
}
