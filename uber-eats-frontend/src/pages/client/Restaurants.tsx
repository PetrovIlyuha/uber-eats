import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CategoriesIconsBar from '../../components/categories/CategoriesIconsBar'
import Restaurant from '../../components/restaurants/Restaurant'
import Container from '../../components/reusable/Container'
import RestaurantsPaginator from '../../components/reusable/RestaurantsPaginator'
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
  const [page, setPage] = useState(1)
  const [getRestaurantsPage, { data, loading, error }] =
    useMutation<restaurantsPageQuery, restaurantsPageQueryVariables>(
      RESTAURANTS_QUERY,
      {
        variables: { input: { page } }
      })

  useEffect(() => {
    getRestaurantsPage()
  }, [page])
  console.log(data);
  const changeToNextPage = () => {
    setPage(page => page + 1)
  }
  const changeToPrevPage = () => {
    setPage(page => page - 1)
  }

  return (
    <>
      <Helmet>
        <title>Restaurants | Grabs Eaters</title>
      </Helmet>
      <form className="bg-gray-800 w-full py-28 flex items-center justify-center">
        <input type="search" placeholder="Search for restaurant..." className="input py-2 w-3/12" />
      </form>
      {!loading && data?.allCategories && (
        <Container>
          <CategoriesIconsBar data={data?.allCategories?.categories} />
          <RestaurantsPaginator
            data={data}
            page={page}
            changeToNextPage={changeToNextPage}
            changeToPrevPage={changeToPrevPage}
          />
          <div className="mt-10 grid lg:grid-cols-3 md:grid-cols-2 gap-x-5 gap-y-10">
            {data?.restaurants?.results?.map(restaurant => (
              <Restaurant
                key={restaurant.id}
                id={String(restaurant.id)}
                coverImage={restaurant?.coverImage}
                name={restaurant?.name}
                categoryName={restaurant?.category?.name}
              />
            ))}
          </div>
          <RestaurantsPaginator
            data={data}
            page={page}
            changeToNextPage={changeToNextPage}
            changeToPrevPage={changeToPrevPage}
          />
        </Container>
      )}
    </>
  )
}

export default Restaurants
