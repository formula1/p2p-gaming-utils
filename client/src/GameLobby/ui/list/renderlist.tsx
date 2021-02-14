import React, {
  Component,
  ChangeEvent
} from "react";

import { GameLobbyType } from "../../types";

import {
  joinGameLobby,
} from "../../api";

type RenderListProps = {
  lobbies:Array<GameLobbyType>
}

class RenderList extends Component<RenderListProps> {

  state: {
    filter: string
  } = {
    filter: ""
  }

  onFilterChange(e: ChangeEvent){
    var target = e.target as HTMLInputElement
    var newValue = target.value;
    this.setState({
      filter: newValue
    })
  }

  render(){
    return (
      <table>
        <thead>
          <tr>
            <th>Name <input
              type="text"
              value={this.state.filter}
              onChange={(e)=>this.onFilterChange(e)}
            /></th>
            <th>Users</th>
            <th>Max Users</th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.lobbies.filter((lobby)=>{
              return lobby.name.search(this.state.filter) > -1
            }).map((lobby)=>{
              return (
                <tr key={lobby._id}>
                  <td><a href="#" onClick={(e)=>{
                    e.preventDefault();
                    joinGameLobby(lobby._id);
                  }}>{lobby.name}</a></td>
                  <td>{lobby.users.length}</td>
                  <td>{lobby.maxUsers}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

export {
  RenderList
}
