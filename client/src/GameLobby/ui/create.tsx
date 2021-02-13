import React, { Component, FormEvent } from "react";
import { RouteComponentProps, withRouter } from 'react-router-dom';

import history from "../../router/history";

import {
  createGameLobby,
  joinGameLobby
} from "../api";

type ChangeEvent = React.ChangeEvent;

import {
  TypeOfGame,
  EditableGameLobbyType,
  TypeOfGameValues
} from "../types";

type onChangePropsFunction = (v: EditableGameLobbyType)=>any


type CreateFormProps = {
  value: EditableGameLobbyType,
  onChange: void | onChangePropsFunction,
  onSubmit: void | ((e: FormEvent<HTMLFormElement>)=>any)
}

function   CreateLobbyForm(props: CreateFormProps){
  return (
    <form onSubmit={(e)=>{
      console.log("on submit");
      props.onSubmit && props.onSubmit(e);
    }}>
      <ul>
        <li>
          <span>Name: </span>
          <input
            type="text"
            value={props.value.name}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                name: e.target.value
              })
            }}
          />
        </li>
        <li>
          <span>Min Users: </span>
          <input
            type="number"
            min="2"
            value={props.value.minUsers}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                minUsers: parseInt(e.target.value)
              })
            }}
          />
        </li>
        <li>
          <span>Max Users: </span>
          <input
            type="number"
            min="2"
            value={props.value.maxUsers}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                maxUsers: parseInt(e.target.value)
              })
            }}
          />
        </li>
        <li>
          <span>Type of Game:</span>
          <select
            value={props.value.typeOfGame}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                typeOfGame: (e.target.value as unknown as TypeOfGame)
              })
            }}
          >
            <option value="TurnBased">Turn Based</option>
            <option value="SameTurn">Same Turn</option>
            <option value="LockStep">Lock Step</option>
            <option value="RollBack">Roll Back</option>
          </select>
        </li>
      </ul>
      <button type="submit">Submit</button>
    </form>
  );
}

class CreateLobbyFormComponent extends Component<RouteComponentProps> {
  state: EditableGameLobbyType = {
    name: "",
    minUsers: 2,
    maxUsers: 2,
    typeOfGame: TypeOfGame.TurnBased
  }

  render(){

    console.log(this.state);
    return <CreateLobbyForm
      value={this.state}
      onChange={(newValue)=>{
        this.setState(newValue)
      }}
      onSubmit={(e)=>{
        e.preventDefault();
        console.log("event prevented")
        const {name, minUsers, maxUsers, typeOfGame} = this.state;
        return Promise.resolve().then(()=>{
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

          return createGameLobby({
            name,
            minUsers,
            maxUsers,
            typeOfGame
          }).then((res)=>{
            console.log("post fetch", res);
            return joinGameLobby(res._id)
          })
        }).catch((err)=>{
          console.error("Error:",err);
        })
      }}
    />
  }
}

var CreateLobbyFormHistoryComponent = withRouter(CreateLobbyFormComponent)

export {
  CreateLobbyFormHistoryComponent
}
