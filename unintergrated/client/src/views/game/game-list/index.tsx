import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import {
  useAuth
} from "../../../context/user";

import {
  Link,
} from "react-router-dom";

export function GameList(){
  const auth = useAuth();

  var [gameFilter, setGameFilter] = useState("");

  var [isFetching, setIsFetching] = useState(false);
  var [fetchError, setFetchError] = useState(void 0);
  var [gamesList, setGamesList] = useState([]);

  async function updateGamesList(){
    if(isFetching) return;
    setIsFetching(true)
    const response = await auth.fetch("/game/list");
    const json = await response.json();
    if(!response.ok){
      return setFetchError(json.message);
    }
    setGamesList(json);
    setIsFetching(false)
  }

  useEffect(()=>{ updateGamesList() }, [])

  var filteredGames;
  if(gameFilter === ""){
    filteredGames = gamesList;
  } else {
    var str = gameFilter.replace("\\", "\\\\")
    var regexp = new RegExp(str);
    filteredGames = gamesList.filter((game)=>{
      return regexp.test(game.lobbyName);
    })
  }

  if(!auth.user){
    return (
      <Navigate
        to={{ pathname: "/login", }}
      />
    )
  }

  return (
    <div>
      {
        fetchError && (
          <div>
            <span>{fetchError}</span>
          </div>
        )
      }
      <div>
        <span>Filter Games:</span>
        <input
          type="text"
          value={gameFilter}
          onChange={(e)=>{
            setGameFilter(e.target.value)
          }}
        />
      </div>
      <div>
        <a
          href="#"
          onClick={(e)=>{
            e.preventDefault()
            updateGamesList()
          }}
        >Refresh</a>
      </div>
      <ul>{
        filteredGames.map((game)=>{
          return (
            <li key={game._id}>
              <div><Link to={"/game-lobby/" + game._id} >{game.lobbyName}</Link></div>
              <div><span>Current players: </span><span>{game.joined.length}</span></div>
              <div><span>Min players: </span><span>{game.minPlayers}</span></div>
              <div><span>Max players: </span><span>{game.maxPlayers}</span></div>
            </li>
          )
        })
      }</ul>
    </div>
  )
}
