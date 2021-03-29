import React from 'react'


const Container: React.FC = ({ children }: React.PropsWithChildren<React.ReactNode>) => {
  return (
    <div className="w-full px-5 xl:px-0 max-w-screen-lg mx-auto">
      {children}
    </div>
  )
}

export default Container
