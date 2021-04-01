import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { BrowserRouter as Router } from 'react-router-dom'
import React from 'react'
import Header from '../Header'
import { CURRENT_USER_QUERY } from '../../hooks/useCurrentUser'


describe("<Header/>", () => {
  it("Should render Header component with verify email banner", async () => {
    await waitFor(async () => {
      const { getByText } = render(
        <MockedProvider mocks={[
          {
            request: {
              query: CURRENT_USER_QUERY
            },
            result: {
              data: {
                me: {
                  id: 1,
                  email: "",
                  role: "Owner",
                  emailVerified: false
                }
              }
            }
          }
        ]}>
          <Router>
            <Header />
          </Router>
        </MockedProvider>
      )
      await new Promise(res => setTimeout(res, 0))
      getByText("Please verify your email ⚠")

    })
  })
  it("Should render Header component without verify email banner", async () => {
    await waitFor(async () => {
      const { queryByText } = render(
        <MockedProvider mocks={[
          {
            request: {
              query: CURRENT_USER_QUERY
            },
            result: {
              data: {
                me: {
                  id: 1,
                  email: "",
                  role: "Owner",
                  emailVerified: true
                }
              }
            }
          }
        ]}>
          <Router>
            <Header />
          </Router>
        </MockedProvider>
      )
      await new Promise(res => setTimeout(res, 0))
      expect(queryByText("Please verify your email ⚠")).toBe(null)
    })
  })
})
