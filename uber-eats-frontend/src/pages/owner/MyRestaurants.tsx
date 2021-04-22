import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Restaurant from '../../components/restaurants/Restaurant'
import Container from '../../components/reusable/Container'
import { ownerRestaurants } from '../../__api_schema_typed__/ownerRestaurants'
import { MdRestaurant } from 'react-icons/md'

export const OWNER_RESTAURANTS = gql`
  query ownerRestaurants {
    ownerRestaurants {
        restaurants {
          name
          id
          coverImage
          address
          category {
            coverImage
            name
            slug
          }
          menu {
            name
            price
            photo
            description
            options {
              name
              choices {
                name
                extra
              }
              extra
            }
          }
        }
        ok
        error
      }
  }
`

const MyRestaurants = () => {
  const { data } = useQuery<ownerRestaurants>(OWNER_RESTAURANTS)
  console.log(data)
  return (
    <div className="bg-gray-100">
      <Helmet>
        <title>My restaurants | Grabs Eaters</title>
      </Helmet>
      <Container>
        {data?.ownerRestaurants?.restaurants.length ? (
          <div className="container">
            <div className="border-b-2 flex items-center w-full md:w-6/12 justify-between mb-8 py-10">
              <span className="text-md md:text-xl text-emerald-800">Create new Restaurant?</span>
              <Link to="/add-restaurant">
                <button className="btn_base py-2 px-10  font-bold text-lg flex items-center justify-between transition-colors">
                  <MdRestaurant className="animate-pulse mr-4"
                    size={30}
                    color="white"
                  />
                  <span className="animate-pulse">Add</span>
                </button>
              </Link>
            </div>
            <h2 className="text-emerald-700 text-2xl">Your restaurants</h2>
            <div className="mt-10 grid lg:grid-cols-3 md:grid-cols-2 gap-x-5 gap-y-10 sm:ml-20 md:ml-20 ml-10">
              {data?.ownerRestaurants?.restaurants?.map(restaurant => (
                <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                  <Restaurant
                    key={restaurant.id}
                    coverImage={restaurant?.coverImage}
                    name={restaurant?.name}
                    categoryName={restaurant?.category?.name}
                  />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex mt-10 flex-col">
            <h2>You have not created restaurants yet! You can do it now</h2>
            <Link to="/add-restaurant">
              <h3 className="text-emerald-600 cursor-pointer">Create</h3>
            </Link>
          </div>
        )}
      </Container>
    </div>
  )
}

export default MyRestaurants
