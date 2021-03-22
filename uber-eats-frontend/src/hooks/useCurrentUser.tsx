import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client';
import { meQuery } from '../__api_schema_typed__/meQuery';

const CURRENT_USER_QUERY = gql`
  query meQuery {
    me {
      id
      email
      role
      emailVerified
    }
  }
`


const useCurrentUser = () => useQuery<meQuery>(CURRENT_USER_QUERY);

export default useCurrentUser
