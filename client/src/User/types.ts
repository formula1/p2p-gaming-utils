
type User = {
  _id: string;
  name: string;
  created: Date;
}

type LoginStrategy = {
  name: string;
  requireName: string;
  url: string;
}

export {
  User,
  LoginStrategy
}
