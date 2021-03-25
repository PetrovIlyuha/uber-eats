import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { restaurantsPageQuery, restaurantsPageQueryVariables } from '../../__api_schema_typed__/restaurantsPageQuery'

const RESTAURANTS_QUERY = gql`
  mutation restaurantsPageQuery($input: RestaurantsInput!) {
    allCategories {
        ok
        error
        categories {
          id
          name
          coverImage
          slug
          restaurantCount
        }
    }
    restaurants (input: $input) {
      ok
      error
      totalPages
      totalResults
      results {
        id
        name
        coverImage
        category {
          id
          name
        }
        address
        isPromoted
      }
  }
  }

`


const Restaurants = () => {
  const [getRestaurantsPage, { data, loading, error }] =
    useMutation<restaurantsPageQuery, restaurantsPageQueryVariables>(
      RESTAURANTS_QUERY,
      {
        variables: { input: { page: 1 } }
      })

  useEffect(() => {
    getRestaurantsPage()
  }, [])

  return (
    <div className="mt-12">
      <Helmet>
        <title>Restaurants | Grabs Eaters</title>
      </Helmet>
      <h1>Restaurants Screen</h1>
    </div>
  )
}

export default Restaurants
