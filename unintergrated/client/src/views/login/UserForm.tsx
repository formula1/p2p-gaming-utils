import * as React from "react";

const EMAIL_TEST = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function UserForm (
  { onSubmit }: { onSubmit: (value: any)=>any}
){

  const [register, setRegister] = React.useState(true);
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [passwordAgain, setPasswordAgain] = React.useState("")

  const errors: {
    [key:string]: string
  } = {}

  if(!EMAIL_TEST.test(email)){
    errors["email"] = "Email is incorrect"
  }

  if(password.length < 1){
    errors["password"] = "Password is Too Short"
  }

  if(register){
    if(username.length < 1){
      errors["username"] = "Username is Too Short"
    }

    if(password !== passwordAgain){
      errors["passwordAgain"] = "Password is incorrect"
    }
  }

  return (
    <form onSubmit={(e)=>{
        e.preventDefault();
        if(Object.keys(errors).length){
          return;
        }
        onSubmit({
          register,
          username,
          email,
          password
        })
      }}
    >
      {register && (
        <div>
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e)=>{setUsername(e.target.value)}}
          />
          {errors["username"] && <div>{errors["username"]}</div>}
        </div>
      )}
      <div>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e)=>{setEmail(e.target.value)}}
        />
        {errors["email"] && <div>{errors["email"]}</div>}
      </div>
      <div>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e)=>{setPassword(e.target.value)}}
        />
        {errors["password"] && <div>{errors["password"]}</div>}
      </div>
      {register && (
        <div>
          <input
            type="password"
            placeholder="password again"
            value={passwordAgain}
            onChange={(e)=>{setPasswordAgain(e.target.value)}}
          />
          {errors["passwordAgain"] && <div>{errors["passwordAgain"]}</div>}
        </div>
      )}
      <div>
        <span>Register: </span>
        <input
          type="checkbox"
          onChange={(e)=>{
            setPasswordAgain("");
            setUsername("");
            setRegister(e.target.checked)
          }}
          checked={register}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={!!Object.keys(errors).length}
        >Submit</button>
      </div>
    </form>
  );
}

export { UserForm };
