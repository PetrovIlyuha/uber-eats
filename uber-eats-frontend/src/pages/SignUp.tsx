import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'

import { emailValid, passwordValid } from '../utils/regexp/validators'
import { accountCreated, accountCreationFailed, passwordError,shortPasswordError} from '../utils/messaging/toasts'

import Logo from '../images/logo.svg'

import FormError from '../components/FormError'
import MainButton from '../components/MainButton'
import { UserRole } from '../__api_schema_typed__/globalTypes'
import { CreateAccountMutation, CreateAccountMutationVariables } from '../__api_schema_typed__/CreateAccountMutation'

const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccountMutation ($createAccountInput: CreateAccountInput!) {
    createAccount(input: $createAccountInput) {
      ok
      error
    }
  }
`

interface RegisterFormFieldsInterface {
  email: string;
  password: string;
  role: UserRole;
}

const SignUp = () => {
  const history = useHistory()
  const { register, getValues, handleSubmit, errors, formState, watch } = useForm<RegisterFormFieldsInterface>({mode: "onBlur", defaultValues: {
    role: UserRole.Client
  }})
  const [createAccountMutation, {data: createAccountResult, loading}] = useMutation<CreateAccountMutation, CreateAccountMutationVariables>(
      CREATE_ACCOUNT_MUTATION,
      {onCompleted: (data: CreateAccountMutation) => {
        const {createAccount: {ok}} = data;
        if (ok) {
          accountCreated.showSuccess()
          setTimeout(() => {
            history.push('/')
          }, 1200)
        }
    }
  })

  useEffect(() => {
    if (errors.password?.type === "pattern") {
      passwordError.showError()
    }
    if (errors.password?.type === 'minLength') {
      shortPasswordError.showError()
    }
  },[errors])

  const onSubmit = () => {
    const{ email, password, role } = getValues()
    createAccountMutation({
      variables: {
        createAccountInput: { email, password, role }
      }
    })
  }
  const onInvalidSubmit = () => {
   accountCreationFailed.showError()
  }

  return (
    <div className="h-screen flex  items-center flex-col lg:mt-44">
      <Helmet>
        <title>Register | Grabs Eaters</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col items-center">
        <img src={Logo} alt="grabs eaters inc." className="xs:w-20 xs:ml-10 sm:w-48 sm:ml-8 lg:w-60 lg:ml-10 max-w-xs " style={{marginBottom: "-2.5rem"}}/>
        <h4 className="w-full text-left px-5 text-2xl font-bold">Become a Grabs Eater!</h4>
        <form className="grid gap-3 mt-5 px-5 w-full" onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
          <input
            name="email"
            required
            placeholder="Email"
            type="email"
            className="input mb-3"
            ref={register({required: "Email is requires", pattern: emailValid})}
          />
          {errors.email && <FormError message="Email is not valid address"/>}
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="input"
            ref={register({required: true, pattern: passwordValid, minLength: 8})}
          />
          {errors.password?.type === 'minLength' && <FormError message="shortPassword"/>}
          {errors.password?.type === 'pattern' && <FormError message="notStrongPassword"/>}
          <select name="role" ref={register({required: true})} className="mt-3 input shadow-md hover:shadow-lg focus:shadow-lg focus:bg-emerald-500 focus:text-white transition-colors">
            {Object.keys(UserRole).map((role,idx) => (
              <option className="p-3 font-2xl" key={idx}>{role}</option>
            ))}
          </select>
            <MainButton loading={loading} text="Create Account" canBeClicked={formState.isValid} />
          {createAccountResult?.createAccount.error && <FormError message={createAccountResult.createAccount.error}/>}
        </form>
        <div className="mt-4 w-full text-left ml-10">
          Have an Account? <Link to="/" className="text-emerald-500 hover:underline text-xl">Login</Link>
        </div>
      </div>
    </div>
  )
}


export default SignUp
