import { model, Model, Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  created: Date;
}

const UserSchema = new Schema({
  name: String,
  created: { type: Date, default: Date.now },
});

const UserModel: Model<Document<IUser>> = model('User', UserSchema);

export {
  IUser,
  UserModel
}
