import { render } from '@testing-library/react'
import React from 'react'
import Restaurant from '../restaurants/Restaurant'

describe("<Restaurant/>", () => {
  it("should render just fine", () => {
    const { debug, getByText } = render(<Restaurant coverImage="image" name="Russian bear" categoryName="russian" />)
    debug()
  })
})
