import React from 'react'
import { Link } from 'react-router-dom'
import Error404Image from '../images/404.svg'

const Page404 = () => {
  return (
    <div className="h-screen flex items-center flex-col">
      <img src={Error404Image} alt="404 page" className="max-w-md" />
      <h4>Tha page you're trying to visit does not exist or could be permanently moved</h4>
      <Link to="/" className="px-10 py-4 mt-10 text-lg font-semibold rounded-md shadow-md hover:shadow-lg bg-emerald-400 transition-all hover:bg-emerald-600 hover:text-white">Go To Home Page &rarr;</Link>
    </div>
  )
}

export default Page404
