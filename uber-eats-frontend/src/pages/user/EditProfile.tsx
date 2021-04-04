import React from 'react'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import FormError from '../../components/FormError'
import MainButton from '../../components/MainButton'
import useCurrentUser from '../../hooks/useCurrentUser'
import { profileUpdated } from '../../utils/messaging/toasts'
import { editProfile, editProfileVariables } from '../../__api_schema_typed__/editProfile'
import { UserRole } from '../../__api_schema_typed__/globalTypes'

const EDIT_PROFILE_MUTATION = gql`
   mutation editProfile ($editProfileInput: EditProfileInput!) {
    editProfile(input: $editProfileInput) {
      ok
      error
    }
 }
`

interface EditProfileProps {
  email?: string;
  password?: string;
  role: UserRole
}

const EditProfile = () => {
  const { data: userData, refetch } = useCurrentUser()
  const onCompleted = async (data: editProfile) => {
    const { editProfile: { ok } }
      = data
    if (ok && userData) {
      await refetch()
      profileUpdated.showSuccess()
    }
  }

  const { register, errors, handleSubmit, formState, getValues } = useForm<EditProfileProps>({ defaultValues: { email: userData?.me.email }, mode: "onBlur" })
  const [editProfile, { data: editProfileResult, loading }] = useMutation<editProfile, editProfileVariables>(EDIT_PROFILE_MUTATION, { onCompleted })

  const onSubmit = () => {
    const { email, password } = getValues()
    editProfile({
      variables: {
        editProfileInput: {
          email,
          password: password?.length ? password : '',
        }
      }
    })
  }

  return (
    <div className="mt-52 flex flex-col justify-center items-center">
      <Helmet>
        <title>Edit Profile | Grabs Eaters</title>
      </Helmet>
      <h2 className="text-2xl font-semibold">Edit Profile</h2>

      <form className="grid gap-3 mt-5 px-5 w-96" onSubmit={handleSubmit(onSubmit)}>
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="input mb-3"
          ref={register({
            validate: {
              rule1: value => value === '' ? true : (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/).test(value)
            }
          })}
        />
        {errors.email && <FormError message="Email is not valid address" />}

        <input
          name="password"
          placeholder="Password"
          type="password"
          className="input"
          ref={register({
            required: false, minLength: 8
          })}
        />
        {errors.password && <FormError message="shortPassword" />}
        <MainButton loading={loading} text="Save new Profile" canBeClicked={formState.isValid} />
        {editProfileResult?.editProfile.error && <FormError message={editProfileResult.editProfile.error} />}
      </form>
    </div>
  )
}

export default EditProfile
