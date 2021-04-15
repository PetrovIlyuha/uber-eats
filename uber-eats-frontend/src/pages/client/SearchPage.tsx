import { useLazyQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useHistory, useLocation } from 'react-router'
import Restaurant from '../../components/restaurants/Restaurant'
import Container from '../../components/reusable/Container'
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
    const searchFor  = search?.split("=")[1]
    if (!searchFor) {
      return history.replace('/')
    } else {
      searchRestarant({ variables: { input: { page: 1, query: searchFor } } })
    }
  }, [history, search, searchRestarant])

  console.log(loading, data, called)
  return (
    <div>
      <Helmet>
        {!searchFor && "No Results for Your Search"}
        {searchFor && (
          <title> Restaurants for "{searchFor}" search</title>
        )}
      </Helmet>
      {!loading && data?.searchRestaurant?.results?.[0] && (
        <Container>
          <div className="mt-12 flex flex-col">
            <div className="mx-auto mb-5">
              <img className="rounded-full h-12 w-14" src={data?.searchRestaurant?.results?.[0].category?.coverImage} alt="category showing" />
            </div>
            <h2 className="text-bold">Found the <strong>"{data?.searchRestaurant?.results?.[0].name}"</strong> place for you</h2>
          <Restaurant
            coverImage={data?.searchRestaurant?.results?.[0]?.coverImage}
            name={data?.searchRestaurant?.results?.[0]?.name}
            categoryName={data?.searchRestaurant?.results?.[0]?.category?.name}
            />
            <h3>Address: {data?.searchRestaurant?.results?.[0]?.address}</h3>
          </div>
        </Container>
      )}
    </div >
  )
}

export default SearchPage
