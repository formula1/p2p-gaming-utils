
type roomId = string;
type userId = string;

type IndexedValueHolder = {
  [key: string]: Array<string>
}

class Rooms {
  rooms: IndexedValueHolder = {}

  users: IndexedValueHolder = {}

  join(room: roomId, userId: userId){
    this.ensureObjectThenPushValue(this.rooms, room, userId);
    this.ensureObjectThenPushValue(this.users, userId, room);
  }

  leave(room: roomId, userId: userId){
    this.removeValueThenTrimObject(this.rooms, room, userId)
    this.removeValueThenTrimObject(this.users, userId, room)
  }

  getUsersInRoom(room: roomId){
    return this.rooms[room]
  }

  getRoomsOfUsers(userId: userId){
    return this.users[userId]
  }

  ensureObjectThenPushValue(object: IndexedValueHolder, key: string, value: string){
    if(!(key in object)){
      object[key] = []
    }
    object[key].push(value)
  }

  removeValueThenTrimObject(object: IndexedValueHolder, key: string, value: string){
    object[key] = object[key].filter((otherValue: string)=>{
      return otherValue !== value;
    })
    if(object[key].length === 0){
      delete object[key]
    }
  }

}

export {
  Rooms
}
