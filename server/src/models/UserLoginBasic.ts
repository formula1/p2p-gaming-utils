import { model, ObjectId, Model, Schema, Types, Document } from "mongoose";

import * as bcrypt from "bcrypt-nodejs"

import {
  UserModel, IUser
} from "./User";

const ObjectId = Types.ObjectId;
interface IUserLoginBasicMethods {
  findUser: ()=>Promise<IUser>;
  comparePassword: (password: string) => boolean;
}

interface IUserLoginBasic extends Document, IUserLoginBasicMethods {
  user: ObjectId;
  email: string;
  password: string;
  token: string;
}

const UserLoginBasicSchema = new Schema({
  user: ObjectId,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  token: String
});

 const hash_password = function( password: string ) {
    let salt = bcrypt.genSaltSync(); // enter number of rounds, default: 10
    let hash = bcrypt.hashSync( password, salt );
    return hash;
};

const randomString = function(){
  return Date.now().toString(32) + Math.random().toString(32).substring(2);
}

UserLoginBasicSchema.methods.findUser = function(): Promise<Document<IUser>> {
  return model("User").findById((this as IUserLoginBasic).user).exec()
};

UserLoginBasicSchema.methods.comparePassword = function(password) {
  var _this = (this as IUserLoginBasic)
  console.log("password:", _this.password)
  if ( ! _this.password ) { return false; }
  return bcrypt.compareSync( password, _this.password );
};


UserLoginBasicSchema.pre('save', function(next) {


  var _this = (this as IUserLoginBasic)
  console.log("pre save pass:", _this.password);
    // check if password is present and is modified.
    if ( _this.password && this.isModified('password') ) {
        _this.password = hash_password(_this.password);
    }
    next();
});

interface UserLoginBasicSchemaStatics {
  findUserByToken: (token: string)=>Promise<Document<IUser>>
  logout: (token: string)=>Promise<IUserLoginBasic>
  findUserByCredentials: (args: { email:string, password: string })=>Promise<Document<IUser>>;
  loginUser: (args: { email: string, password: string })=>Promise<string>
  registerUser: (args: { username: string, email: string, password: string })=>Promise<Document<IUser>>
}

UserLoginBasicSchema.static(
  "findUserByToken",
  (token: string): Promise<Document<IUser>>=>{
    const UserLoginBasic = model("UserLoginBasic");
    return UserLoginBasic.findOne({
      token
    }).then((uLB: IUserLoginBasic)=>{
      return model("User").findById(uLB.user).exec()
    })
  }
);

UserLoginBasicSchema.static(
  "logout",
  function(user: string): Promise<Document<IUserLoginBasic>> {
    const UserLoginBasic = model("UserLoginBasic");
    return UserLoginBasic.findOne({
      user
    }).then((uLB: IUserLoginBasic)=>{
      uLB.token = "";
      return uLB.save()
    })
  }
);


UserLoginBasicSchema.static(
  "findUserByCredentials", function(
    {email, password}: { email:string, password: string }
  ): Promise<Document<IUser>>{
    const UserLoginBasic = model("UserLoginBasic");
    const User = model("User");
    return UserLoginBasic.findOne({
      email
    }).then((userLoginBasic: void | Document)=>{
      if(!userLoginBasic){
        throw new Error("email does not exist");
      }
      var uLB = userLoginBasic as IUserLoginBasic;
      if(!uLB.comparePassword(password)){
        throw new Error("incorrect password")
      }
      return User.findById(uLB.user)
    });
  }
);

UserLoginBasicSchema.static(
  'loginUser', function(
    {email, password}: { email:string, password: string }
): Promise<string> {
  const UserLoginBasic = model("UserLoginBasic");
  return UserLoginBasic.findOne({
    email
  }).then((userLoginBasic: void | Document)=>{
    if(!userLoginBasic){
      throw new Error("email does not exist");
    }
    var uLB = userLoginBasic as IUserLoginBasic;
    if(!uLB.comparePassword(password)){
      throw new Error("incorrect password")
    }
    uLB.token = randomString();
    return uLB.save().then((doc: IUserLoginBasic )=>{
      return doc.token;
    })
  })
});

UserLoginBasicSchema.static(
  'registerUser', function(
    {username, email, password}: { username: string, email:string, password: string }
): Promise<string> {
  const UserLoginBasic = model("UserLoginBasic");
  const User = model("User");
  var newUserLoginBasic = new UserLoginBasic({
    email: email,
    password: password,
    token: randomString()
  })
  return newUserLoginBasic.save().then((userLogin: IUserLoginBasic)=>{
    console.log("value:", userLogin);
    return User.create({
      name: username
    }).then((user: IUser)=>{
      userLogin.user = user._id;
      return userLogin.save().then(()=>{
        return userLogin.token;
      });
    })
  })
})

const UserLoginBasicModel: Model<IUserLoginBasic> & UserLoginBasicSchemaStatics = model("UserLoginBasic", UserLoginBasicSchema) as any;

export {
  UserLoginBasicModel, IUserLoginBasic
}
