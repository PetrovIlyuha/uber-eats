import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { AiOutlineLoading3Quarters } from 'react-icons/ai'

import { isLoggedInVar } from '../apollo'
import { meQuery } from '../__api_schema_typed__/meQuery'
import Restaurants from '../pages/client/Restaurants'
import Page404 from '../pages/404'
import Header from '../components/Header'
import useCurrentUser from '../hooks/useCurrentUser'

const ClientRouter = () => (
  <Switch>
    <Route path="/" exact>
      <Restaurants />
    </Route>
    <Route component={Page404} exact path="*" />
  </Switch>
)



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

export const LoggedInRouter = () => {
  const logOut = () => {
    isLoggedInVar(false)
  }
  const { data, loading, error } = useCurrentUser();
  console.log(data?.me.role)
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <h2 className="mb-10 text-2xl font-medium tracking-wider">Wait. Just Watch</h2>
          <AiOutlineLoading3Quarters className="animate-spin" size={100} color="green" />
        </div>
      </div>
    )
  }
  return (
    <Router>
      <Header/>
      {data.me.role === 'Client' && <ClientRouter/>}
    </Router >
  )
}
