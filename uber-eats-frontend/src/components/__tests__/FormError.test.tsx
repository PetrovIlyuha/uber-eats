import { render } from '@testing-library/react'
import React from 'react'
import FormError from '../FormError'


describe("<FormError/>", () => {
  it("should show short password error", () => {
    const { debug, getByText } = render(<FormError message="shortPassword" />)
    getByText("Password must be at least 8 characters long")
  })
  it("should show not strong enough password error", () => {
    const { debug, getByText } = render(<FormError message="notStrongPassword" />)
    getByText("Strong password should include one of special characters !@#, at least 1 Capital letter and one numerical value")
  })
  it("should show custom error message", () => {
    const { getByText } = render(<FormError message="email not valid" />)
    getByText("email not valid")
  })
})
