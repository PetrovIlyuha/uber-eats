import { useApolloClient, useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router'
import SpinnerBasic from '../../components/reusable/SpinnerBasic'
import useCurrentUser from '../../hooks/useCurrentUser'
import { verifyEmail, verifyEmailVariables } from '../../__api_schema_typed__/verifyEmail'

const VERIFY_EMAIL_MUTATION = gql`
  mutation verifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      ok
      error
    }
  }
`
const ConfirmEmail = () => {
  const client = useApolloClient()
  const { data: userData, refetch } = useCurrentUser()
  const history = useHistory()
  const onEmailVerified = (data: verifyEmail) => {
    const { verifyEmail: { ok } } = data
    if (ok && userData?.me) {
      client.writeFragment({
        id: `User:${userData?.me.id}`,
        fragment: gql`
          fragment VerifiedUser on User {
            emailVerified
          }
        `,
        data: {
          emailVerified: true
        }
      })
      history.push('/')
    }
  }
  const [verifyEmail] = useMutation<verifyEmail, verifyEmailVariables>(VERIFY_EMAIL_MUTATION, { onCompleted: onEmailVerified })
  const location = useLocation()
  useEffect(() => {
    const code = location.search.split('?code=')[1]
    verifyEmail({
      variables: {
        input: {
          code
        }
      }
    })
  }, [])
  return (
    <div className="h-screen flex flex-col items-center mt-36">
      <div className="mb-20">
        <SpinnerBasic />
      </div>
      <h2 className="text-lg mb-2 font-semibold">Confirming Email...</h2>
      <h4>Please wait! Do not close the page!</h4>
    </div>
  )
}

export default ConfirmEmail
