import { useLazyQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useHistory, useLocation } from 'react-router'
import { searchRestaurant, searchRestaurantVariables } from '../../__api_schema_typed__/searchRestaurant'

const SEARCH_RESTAURANT = gql`
  query searchRestaurant($input: SearchRestaurantInput!) {
    searchRestaurant(input: $input) {
      ok
      error
      totalPages
      totalResults
      results {
        id
        name
        coverImage
        address
        category {
          name
          coverImage
        }
        address
        isPromoted
      }
    }
  }
`;

const SearchPage: React.FC = () => {
  const { search } = useLocation()
  const searchFor = search?.split("=")[1]
  const history = useHistory()
  const [searchRestarant, { loading, data, called }] = useLazyQuery<searchRestaurant, searchRestaurantVariables>
    (SEARCH_RESTAURANT)
  useEffect(() => {
    const [_, searchFor] = search?.split("=")
    if (!searchFor) {
      return history.replace('/')
    } else {
      searchRestarant({ variables: { input: { page: 1, query: searchFor } } })
    }
  }, [history, search])
  console.log(loading, data, called)
  return (
    <div>
      <Helmet>
        {!searchFor && "No Results for Your Search"}
        {searchFor && (
          <title> Restaurants for "{searchFor}" search</title>
        )}
      </Helmet>

    </div >
  )
}

export default SearchPage
