import React from 'react'


const Container: React.FC = ({ children }: React.PropsWithChildren<React.ReactNode>) => {
  return (
    <div className="w-full h-full px-5 xl:px-0 max-w-screen-lg mx-auto bg-gray-100">
      {children}
    </div>
  )
}

export default Container
