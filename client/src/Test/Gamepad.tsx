import React, { Component } from "react";

type GamePadConnectListenerType = (e:GamepadEvent)=>any
type GamePadButtonListenerType = (e:GamepadEvent)=>any

class MultipleGamePadsTestUI extends Component {
  gamePadConnectListener: GamePadConnectListenerType;
  gamePadDisconnectListener: GamePadConnectListenerType;
  state: {
    gamePads: Array<number>
  } = { gamePads: [] }

  componentDidMount(){

    console.log("hello worlds");
    console.log(navigator.getGamepads());

    this.gamePadConnectListener = (e)=>{
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      e.gamepad.index, e.gamepad.id,
      e.gamepad.buttons.length, e.gamepad.axes.length);

      this.setState({
        gamePads: this.state.gamePads.concat([e.gamepad.index])
      })
      console.log(navigator.getGamepads());

    }
    window.addEventListener("gamepadconnected", this.gamePadConnectListener);

    this.gamePadDisconnectListener = (e)=>{
      console.log("Gamepad disconnected from index %d: %s",
      e.gamepad.index, e.gamepad.id);
      this.setState({
        gamePads: this.state.gamePads.filter((index)=>{
          return index != e.gamepad.index
        })
      })

      console.log(navigator.getGamepads());
    }
    window.addEventListener("gamepaddisconnected", this.gamePadDisconnectListener);
    var gamePads = navigator.getGamepads();

    this.setState({
      gamePads: gamePads.map((gp)=>{
        return gp.index
      })
    })
  }

  componentWillUnmount(){
    window.removeEventListener("gamepadconnected", this.gamePadConnectListener);
    window.removeEventListener("gamepaddisconnected", this.gamePadDisconnectListener);
  }


  render(){
    return (
      <div>
      {this.state.gamePads.map((index)=>{
        return <GamePadTestUI gamePad={index} />
      })}
      </div>
    )
  }
}


type GamePadTestUIProps = {

  gamePad: number
}

class GamePadTestUI extends Component<GamePadTestUIProps> {
  interval: any;

  state: {
    axes: Array<number>,
    buttons: Array<boolean>
  } = {
    axes: [],
    buttons: []
  }

  componentDidMount(){
    this.interval = setInterval(()=>{
      var gamPads = navigator.getGamepads();
      var gamePad = gamPads[this.props.gamePad]

      this.setState({
        axes: gamePad.axes,
        buttons: gamePad.buttons.map((b)=>{
          return b.pressed
        })
      })
    }, 1000/60)
  }

  componentWillUnmount(){
    clearInterval(this.interval);
  }

  render(){
    var gamPads = navigator.getGamepads();
    var gamePad = gamPads[this.props.gamePad]

    return (
      <div>
        <div>Gamepad connected at index {gamePad.index} : {gamePad.id}.</div>
        <div>Numbeer of Buttons: {gamePad.buttons.length}</div>
        <div>Numbeer of Axes: {gamePad.axes.length}</div>
        <div>
          <h1>Axes</h1>
          <ul>
            {this.state.axes.map((value, index)=>{
              return (
                <li><span>Index: {index}</span><span>  -  </span><span>{value}</span></li>
              );
            })}
          </ul>
        </div>
        <div>
          <h1>Buttons</h1>
          <ul>
            {this.state.buttons.map((value, index)=>{
              return (
                <li><span>Button: {index}</span><span>  -  </span><span>{value.toString()}</span></li>
              );
            })}
          </ul>
        </div>

      </div>
    );
  }

}

export {
  MultipleGamePadsTestUI
}
