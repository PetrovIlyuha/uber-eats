import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import { Link } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import Logo from '../images/logo.svg'

const Header: React.FC = () => {
  const { data } = useCurrentUser();
  return (
    <>
      {!data?.me.emailVerified && <div className="bg-red-400 py-3 px-3 text-center text-sm text-white">
        <span>Please verify your email ⚠ </span>
      </div>}
      <header className="bg-gray-200 py-4">
        <div className="w-full px-5 xl:px-0 max-w-screen-lg mx-auto flex justify-between items-center">
          <Link to="/">
            <img src={Logo} alt="logo" className="w-24" />
          </Link>
          {data?.me && (
            <Link to="/edit-profile">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </Link>
          )}
        </div>
      </header>
    </>
  )
}

export default Header
