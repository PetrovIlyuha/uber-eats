import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { isLoggedInVar } from '../../apollo'
import App from '../App'

jest.mock("../../routers/logged-out-router.tsx", () => {
  return {
    LoggedOutRouter: () => <h3>Logged out</h3>
  }
})

jest.mock('../../routers/logged-in-router.tsx', () => {
  return {
    LoggedInRouter: () => <h3>Logged in</h3>
  }
})

describe("<App/>", () => {
  it("renders logged out router", () => {
    const { debug, getByText } = render(<App />)
    getByText('Logged out')
  })
  it("renders logged in router", async () => {
    const { getByText } = render(<App />)
    await waitFor(() => {
      isLoggedInVar(true)
    })
    getByText("Logged in")
  })
})
