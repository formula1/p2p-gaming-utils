import React, { useState, FormEvent } from "react";

import history from "../../router/history"

import { UserSubmit } from "../types"

import {
  UserContext
} from "../context";


type onChangePropsFunction = (v: UserSubmit)=>any

type RegisterLoginFormProps = {
  value: UserSubmit,
  errors: Array<any>,
  onChange: void | onChangePropsFunction,
  onSubmit: void | ((e: FormEvent<HTMLFormElement>)=>any)
}


function RegisterLogin(){
  const [registerState, setRegisterState] = useState({
    username: "",
    email: "",
    password: "",
    register: false
  });
  const [submitErrors, setSubmitErrors] = useState([]);
  return (
    <UserContext.Consumer>
      {({ updateUser })=>{
        return (
          <RegisterLoginForm
            value={registerState}
            errors={submitErrors}
            onChange={(newValue)=>{
              setRegisterState(newValue)
            }}
            onSubmit={(e)=>{
              e.preventDefault()
              updateUser(registerState);
            }}
          />
        )
      }}
    </UserContext.Consumer>
  )
}

function RegisterLoginForm(props: RegisterLoginFormProps){
  return (
    <form
      onSubmit={(e)=>{
        props.onSubmit && props.onSubmit(e)
      }}
    >
      <div>
      {
        !props.value.register ? null : (
          <div>
            <span>Username:</span>
            <input
              type="text"
              value={props.value.username}
              onChange={(e)=>{
                props.onChange && props.onChange({
                  ...props.value,
                  username: e.target.value
                })
              }}
            />
          </div>
        )
      }
        <div>
          <span>Email:</span>
          <input
            type="text"
            value={props.value.email}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                email: e.target.value
              })
            }}
          />
        </div>
        <div>
          <span>password:</span>
          <input
            type="password"
            value={props.value.password}
            onChange={(e)=>{
              props.onChange && props.onChange({
                ...props.value,
                password: e.target.value
              })
            }}
          />
        </div>
        <div>
          <span>Register:</span>
          <input
              type="checkbox"
              value="register"
              checked={props.value.register}
              onChange={(e)=>{
                props.onChange && props.onChange({
                  ...props.value,
                  register: e.target.checked
                })
              }}
          />
        </div>
        <div>
          <button className="btn btn-default" type="submit">Submit</button>
        </div>
      </div>
    </form>
  )
}

export {
  RegisterLogin
}
