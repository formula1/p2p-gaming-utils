import * as semver from "semver";

export async function validateGameJson(str: string){

  const json = JSON.parse(str)

  console.log(json);


  const version = resolveVersion(json.version);

  const players = resolvePlayers(json.players)

  const turnType = resolveTurnType(json.turnType)

  return {
    name: json.name,
    version: version,
    players,
    turnType
  }
}

function resolveVersion(version: string){
  if(!semver.valid(version)){
    throw new Error("invalid semver: " + version);
  }
  return version;
}

type PlayersProp = void | number | {
  max: void | number,
  min: void | number,
};

function resolvePlayers(players: PlayersProp ): { max: number, min: number}{

  var typeofPlayers = typeof players;
  if(typeof players === "number"){
    return {
      min: players,
      max: players
    };
  }
  if(typeof players === "undefined"){
    return {
      min: 0,
      max: Number.MAX_VALUE
    };
  }
  if(typeof players !== "object"){
    throw new Error(
      "the players key must be a number or {min:number, max:number}"
    );
  }

  function handleProp(propName: string, propValue: void | number, defaultValue: number): number{
    if(typeof propValue === "number"){
      return propValue
    }
    if(typeof propValue === "undefined"){
      return defaultValue
    }
    throw new Error(propName + " must be a number or not defined")
  }

  var min = handleProp(
    "min players",
    players.min,
    0
  )

  var max = handleProp(
    "max players",
    players.max,
    Number.MAX_VALUE
  )

  if(min > max){
    throw new Error("min players must be less than or equal to max players");
  }

  return { min, max };
}


const VALID_TURN_TYPES = [
  "ROLL_BACK",
  "LOCK_STEP",
  "NO_RESTRICTION",
  "HOSTED",
  "TURN_BASED"
]
function resolveTurnType(inputTurnType: string){
  const capTurnType = inputTurnType.toUpperCase();

  if(VALID_TURN_TYPES.some((validTurnType)=>{
    return validTurnType === capTurnType
  })){
    return capTurnType;
  }
  throw new Error(
    inputTurnType + " is not a valid turn type: " + JSON.stringify(VALID_TURN_TYPES)
  );
}
