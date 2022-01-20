import {
  model,
  Model,
  Schema,
  Types,
  Document,
} from "mongoose";

const ObjectId = Types.ObjectId;

import * as bcrypt from "bcrypt-nodejs"

import {
  UserModel, IUser
} from "./User";

interface IUserLoginBasicMethods {
  findUser: ()=>Promise<IUser>;
  comparePassword: (password: string) => boolean;
}

interface IUserLoginBasic extends Document, IUserLoginBasicMethods {
  user: typeof ObjectId;
  email: string;
  password: string;
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
});

const hash_password = function( password: string ) {
  let salt = bcrypt.genSaltSync(); // enter number of rounds, default: 10
  let hash = bcrypt.hashSync( password, salt );
  return hash;
};


UserLoginBasicSchema.methods.findUser = function(): Promise<IUser> {
  return model("User").findById((this as IUserLoginBasic).user).exec().then((value: IUser)=>{
    return value;
  })
};

UserLoginBasicSchema.methods.comparePassword = function(password) {
  var _this = (this as IUserLoginBasic)
  if ( ! _this.password ) { return false; }
  return bcrypt.compareSync( password, _this.password );
};


UserLoginBasicSchema.pre('save', function(next) {
  var _this = (this as IUserLoginBasic)
  console.log("pre save pass:", _this.password);
  // check if password is present and is modified.
  if ( _this.isNew || this.isModified('password') ) {
      _this.password = hash_password(_this.password);
  }
  console.log("post save pass", _this.password)
  next();
});

interface UserLoginBasicSchemaStatics {
  findUserByCredentials: (args: { email:string, password: string })=>Promise<IUser>;
  loginUser: (args: { email: string, password: string })=>Promise<IUser>
  registerUser: (args: { username: string, email: string, password: string })=>Promise<IUser>
}

UserLoginBasicSchema.static(
  "findUserByCredentials", function(
    {email, password}: { email:string, password: string }
  ): Promise<IUser>{
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
      return User.findById(uLB.user).then((user: IUser)=>{
        return user;
      })
    });
  }
);

UserLoginBasicSchema.static(
  'loginUser', function(
    {email, password}: { email:string, password: string }
): Promise<IUser> {
  const User = model("User");
  const UserLoginBasic = model("UserLoginBasic");
  return UserLoginBasic.findOne({
    email
  }).then((userLoginBasic: Document)=>{
    if(!userLoginBasic){
      throw new Error("email does not exist");
    }
    var uLB = userLoginBasic as IUserLoginBasic;
    if(!uLB.comparePassword(password)){
      throw new Error("incorrect password")
    }
    return User.findById(uLB.user).then((user: IUser)=>{
      return user;
    });
  })
});

UserLoginBasicSchema.static(
  'registerUser', function(
    {username, email, password}: { username: string, email:string, password: string }
): Promise<IUser> {
  const UserLoginBasic = model("UserLoginBasic");
  const User = model("User");
  var newUserLoginBasic = new UserLoginBasic({
    email: email,
    password: password,
  }) as IUserLoginBasic;

  return newUserLoginBasic.save().then((userLogin: IUserLoginBasic)=>{
    return User.create({
      name: username
    }).then((user: IUser)=>{
      userLogin.user = user._id;
      return userLogin.save().then(()=>{
        return user;
      })
    })
  })
})

const UserLoginBasicModel: Model<IUserLoginBasic> & UserLoginBasicSchemaStatics = model("UserLoginBasic", UserLoginBasicSchema) as any;

export {
  UserLoginBasicModel, IUserLoginBasic
};
