import React, { useEffect, useState } from 'react'
import { isLoggedInVar } from '../apollo'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import Page404 from '../pages/404'


export const LoggedOutRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Login />
        </Route>
        <Route path="/create-account">
          <SignUp />
        </Route>
        <Route path="*">
          <Page404 />
        </Route>
      </Switch>
    </Router>
  )
}
