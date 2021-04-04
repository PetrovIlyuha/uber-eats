import { useQuery } from '@apollo/client'
import { motion } from 'framer-motion'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { BiDish } from 'react-icons/bi'
import { RiAdvertisementLine } from 'react-icons/ri'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import Container from '../../components/reusable/Container'
import SpinnerBasic from '../../components/reusable/SpinnerBasic'
import { ownerSingleRestaurant, ownerSingleRestaurantVariables, ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu } from '../../__api_schema_typed__/ownerSingleRestaurant'

export const QUERY_MY_RESTAURANT = gql`
  query ownerSingleRestaurant($input: OwnerRestaurantInput!) {
    ownersSingleRestaurant(input: $input) {
      ok
      error
      restaurant {
        id
        createdAt
        name
        coverImage
        address
        category {
          name
          id
          coverImage
          slug
        }
        isPromoted
        promotionActiveUntil
        menu {
          id
          name
          price
          photo
          description
          options {
            name
            extra
            choices {
              name
              extra
            }
          }
        }
      }
    }
  }
`

const SingleRestaurant = () => {
  const { id } = useParams<{ id: string }>()

  const { data, loading, error } = useQuery<ownerSingleRestaurant, ownerSingleRestaurantVariables>(
    QUERY_MY_RESTAURANT, { variables: { input: { id: +id } } }
  )
  console.log(data, loading, error)
  return (
    <div className="bg-gray-100 max-h-full">
      <Container>
        {loading && (
          <div className="h-screen flex flex-col">
            <div className="mt-72 justify-self-center place-items-center">
              <h2 className="text-center mb-10 text-2xl animate-pulse pl-2">Loading...</h2>
              <SpinnerBasic />
            </div>
          </div>
        )}
        {!loading && data?.ownersSingleRestaurant?.restaurant && (
          <div className=" flex flex-col relative top-0">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{ background: `url(${data?.ownersSingleRestaurant?.restaurant?.coverImage})`, objectFit: 'cover' }}
              className="h-1/4 shadow-xl py-32" />
            <motion.h2 initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="mt-10 bg-green-200 rounded-sm py-2 pl-4 text-xl italic">{data.ownersSingleRestaurant.restaurant.name}</motion.h2>
            <motion.div className="flex w-full justify-around" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>

              <Link to={`/restaurant/${data?.ownersSingleRestaurant?.restaurant.id}/addMenuItem`}>
                <button className="btn_base py-2 px-10 bg-blue-400 hover:bg-blue-600 mt-10 font-bold text-lg flex items-center justify-between transition-colors">
                  <BiDish className="animate-pulse mr-4"
                    size={30}
                    color="white"
                  />
                  <span className="animate-pulse">Add</span>
                </button>
              </Link>
              <Link to="/buy-promotion">
                <button className="btn_base py-2 bg-yellow-300 hover:bg-yellow-400 px-10 mt-10 font-bold text-lg text-black flex items-center justify-between transition-colors">
                  <RiAdvertisementLine className="animate-pulse mr-4"
                    size={30}
                  />
                  <span className="animate-pulse">Promote your restaurant</span>
                </button>
              </Link>
            </motion.div>
            <div className="h-screen">
              {data?.ownersSingleRestaurant?.restaurant?.menu.length === 0 ? (
                <h3 className="ml-32 mt-4">Now you can create the menu</h3>
              ) :
                (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1 }} className="my-10 bg-gray-200 rounded-md shadow-lg">
                    <h2 className="text-center text-2xl italic pt-8 pb-5">Menu</h2>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2">
                      {data?.ownersSingleRestaurant?.restaurant?.menu.map((dish: ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu) => (
                        <div className="mx-auto py-12 px-4 w-92 sm:px-6 lg:px-8" key={dish.id}>
                          <div className="mx-auto">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                              <div className="border-b border-gray-200 px-4 py-5 h-24 sm:px-6 bg-emerald-600 text-white font-semibold">
                                <h2 className="text-center text-lg">{dish.name}</h2>
                              </div>
                              <div className="px-4 py-5 sm:p-6">
                                {dish?.photo && (
                                  <img src={dish?.photo} className="border-2 border-dashed border-gray-300 rounded bg-white md:h-60 sm:h-80 w-full text-gray-200" aria-hidden="true" />
                                )}
                              </div>
                              <div className="border-t border-gray-200 px-4 py-4 sm:px-6 h-32 flex items-center justify-center text-left">
                                <h3>{dish.description}</h3>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                      )}
                    </div>
                  </motion.div>)}
            </div>
          </div>
        )
        }
      </Container >
    </div>
  )
}

export default SingleRestaurant
