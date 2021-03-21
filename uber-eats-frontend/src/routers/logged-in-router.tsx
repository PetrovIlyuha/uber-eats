import React from 'react'
import { isLoggedInVar } from '../apollo'

export const LoggedInRouter = () => {
  const logOut = () => {
    isLoggedInVar(false)
  }
  return (
    <div>
      <h1>Logged In</h1>
      <button onClick={logOut} className="btn bg-contain bg-red-300">Click to Logout</button>
    </div>
  )
}
