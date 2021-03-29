import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import Container from '../../components/reusable/Container'
import { restaurant, restaurantVariables } from '../../__api_schema_typed__/restaurant'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface RestaurantPageProps {
  id: string;
}

const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurauntInput!) {
     restaurant(input: $input) {
      ok
      restaurant {
        name
        id
        coverImage
        address
        menu {
          name
          price
        }
        category {
          name
          coverImage
          id
        }
      }
    }
  }
`


const Restaurant = () => {
  const { id } = useParams<RestaurantPageProps>()
  const { loading, data } = useQuery<restaurant, restaurantVariables>(RESTAURANT_QUERY, { variables: { input: { restaurantId: Number(id) } } })
  console.log(data);
  return (
    <Container>
      {!loading && data?.restaurant && (
        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.3, }} className="bg-emerald-400 py-40 mt-10 shadow-xl" style={{ backgroundImage: `url(${data?.restaurant?.restaurant?.coverImage})`, backgroundSize: 'cover' }}>
          <motion.div className="bg-green-900 py-4 shadow-lg w-4/12 flex justify-center text-white text-2xl flex-col" initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.35 }}>
            <h4 className="ml-5 text-3xl">{data?.restaurant?.restaurant?.name}</h4>
            <h5 className="text-md ml-5">{data?.restaurant?.restaurant?.address}</h5>
            <h5 className="text-sm ml-5 mt-3 font-light">Kitchen: {` `}
              <Link to={`/category/${data?.restaurant?.restaurant?.category?.name}`}>
                {data?.restaurant?.restaurant?.category?.name}
              </Link>
            </h5>
          </motion.div>
        </motion.div>
      )}
    </Container>
  )
}

export default Restaurant
