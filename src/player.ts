

abstract class Player {
  listeners: Array<any>;
  sendAction(): Promise<boolean>;
  onRecieveAction(){

  }
}
