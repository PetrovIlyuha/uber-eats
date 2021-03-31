import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { emailValid, passwordValid } from '../utils/regexp/validators'
import Logo from '../images/logo.svg'
import { authToken, isLoggedInVar } from '../apollo'
import { passwordError, shortPasswordError } from '../utils/messaging/toasts'
import FormError from '../components/FormError'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
import { LoginMutation, LoginMutationVariables } from '../__api_schema_typed__/LoginMutation'
import MainButton from '../components/MainButton'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LOCAL_STORAGE_TOKEN } from '../constants'

const LOGIN_MUTATION = gql`
  mutation LoginMutation ($loginInput: LoginInput!) {
    login (input: $loginInput) {
      ok
      token
      error
    }
  }
`

interface LoginFormFieldsInterface {
  email: string;
  password: string;
}


const Login = () => {
  const logIn = () => {
    isLoggedInVar(true)
  }
  const onLoginComplete = (data: LoginMutation) => {
    const { login: { ok, token } } = data;
    if (ok && token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN, token)
      authToken(token)
      logIn()
    }
  }
  const { register, getValues, handleSubmit, errors, formState } = useForm<LoginFormFieldsInterface>({ mode: "onBlur" })
  const [loginMutation, { data: loginMutationResult, loading }] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION, {
    onCompleted: onLoginComplete,
  })


  useEffect(() => {
    if (errors.password?.type === "pattern") {
      passwordError.showError()
    }
    if (errors.password?.type === 'minLength') {
      shortPasswordError.showError()
    }
  }, [errors])

  const onSubmit = () => {
    const { email, password } = getValues()
    loginMutation({
      variables: {
        loginInput: { email, password }
      }
    })
  }
  const onInvalidSubmit = () => {
    console.log("Cant do that")
  }

  return (
    <div className="h-screen flex  items-center flex-col lg:mt-60">
      <Helmet>
        <title>Login | Grabs Eaters</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col items-center">
        <img src={Logo} alt="grabs eaters inc." className="xs:w-20 xs:ml-10 sm:w-48 sm:ml-8 lg:w-60 lg:ml-10 max-w-xs " style={{ marginBottom: "-2.5rem" }} />
        <h4 className="w-full text-left px-5 text-2xl font-bold">Welcome to Grabs!</h4>
        <form className="grid gap-3 mt-5 px-5 w-full" onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
          <input
            name="email"
            required
            placeholder="Email"
            type="email"
            className="input mb-3"
            ref={register({ required: "Email is requires", pattern: emailValid })}
          />
          {errors.email && <FormError message="Email is not valid address" />}
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="input"
            ref={register({ required: true, pattern: passwordValid, minLength: 8 })}
          />
          {errors.password?.type === 'minLength' && <FormError message="shortPassword" />}
          {errors.password?.type === 'pattern' && <FormError message="notStrongPassword" />}
          <MainButton loading={loading} text="Login" canBeClicked={formState.isValid} />
          {loginMutationResult?.login.error && <FormError message={loginMutationResult.login.error} />}
        </form>
        <div className="mt-4 w-full text-left ml-10">
          New to Grabs Eaters? <Link to="/create-account" className="text-emerald-500 hover:underline text-xl">Create an Account</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
