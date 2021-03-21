import React, { useEffect, useState } from 'react'
import { isLoggedInVar } from '../apollo'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'


export const LoggedOutRouter = () => {

  return (
    <Router>
      <Switch>
      <Route path="/" exact>
        <Login/>
      </Route>
      <Route path="/create-account">
        <SignUp/>
      </Route>
      </Switch>
    </Router>
  )
}
