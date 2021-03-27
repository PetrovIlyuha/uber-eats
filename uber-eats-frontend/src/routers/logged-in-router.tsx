import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { isLoggedInVar } from '../apollo'
import Restaurants from '../pages/client/Restaurants'
import Page404 from '../pages/404'
import Header from '../components/Header'
import useCurrentUser from '../hooks/useCurrentUser'
import ConfirmEmail from '../pages/user/ConfirmEmail'
import SpinnerBasic from '../components/reusable/SpinnerBasic'
import EditProfile from '../pages/user/EditProfile'
import SearchPage from '../pages/client/SearchPage'
import Category from '../pages/client/Category'

const ClientRouter = () => (
  <Switch>
    <Route path="/" exact>
      <Restaurants />
    </Route>
    <Route path="/confirm">
      <ConfirmEmail />
    </Route>
    <Route component={Page404} />
  </Switch>
)

export const LoggedInRouter = () => {
  const logOut = () => {
    isLoggedInVar(false)
  }
  const { data, loading, error } = useCurrentUser();
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <h2 className="mb-10 text-2xl font-medium tracking-wider">Wait. Just Watch</h2>
          <SpinnerBasic />
        </div>
      </div>
    )
  }
  return (
    <Router>
      <Header />
      {data.me.role === 'Client' && (
        <Switch>
          <Route path="/" exact>
            <Restaurants />
          </Route>
          <Route path="/confirm">
            <ConfirmEmail />
          </Route>
          <Route path="/edit-profile">
            <EditProfile />
          </Route>
          <Route path="/category/:slug">
            <Category />
          </Route>
          <Route path="/search">
            <SearchPage />
          </Route>
          <Route component={Page404} />
        </Switch>
      )}
    </Router >
  )
}
