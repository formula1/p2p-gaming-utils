import { model, Model, Types, Schema, Document } from "mongoose";

const ObjectId = Types.ObjectId;

interface IProfile extends Document {
  user: typeof ObjectId;
  username: String;
}

const ProfileSchema = new Schema({
  user: { type : ObjectId, require: true },
  username: { type : String, require: true },
});

const ProfileModel: Model<Document> = model('Profile', ProfileSchema);

export {
  IProfile,
  ProfileModel
}
