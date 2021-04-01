import { render } from '@testing-library/react'
import React from 'react'
import MainButton from '../MainButton'


describe("<Button/>", () => {
  it("should render with props", () => {
    const { debug, getByText, rerender } = render(<MainButton canBeClicked={true} loading={false} text="Test" />)
    getByText('Test')
    rerender(<MainButton canBeClicked={false} loading={true} text="Loading..." />)
  })
})
