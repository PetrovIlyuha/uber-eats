import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import CategoriesIconsBar from '../../components/categories/CategoriesIconsBar'
import Restaurant from '../../components/restaurants/Restaurant'
import Container from '../../components/reusable/Container'
import RestaurantsPaginator from '../../components/reusable/RestaurantsPaginator'
import HeroBanner from '../../images/hero_banner-min.jpg'
import { restaurantsPageQuery, restaurantsPageQueryVariables } from '../../__api_schema_typed__/restaurantsPageQuery'

const RESTAURANTS_QUERY = gql`
  query restaurantsPageQuery($input: RestaurantsInput!) {
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
`;


const Restaurants = () => {
  const [page, setPage] = useState(1)
  const history = useHistory()
  const { register, handleSubmit, getValues } = useForm()
  const { data, loading } = useQuery<restaurantsPageQuery, restaurantsPageQueryVariables>(
    RESTAURANTS_QUERY,
    {
      variables: { input: { page } }
    })

  const changeToNextPage = () => {
    setPage(page => page + 1)
  }
  const changeToPrevPage = () => {
    setPage(page => page - 1)
  }

  const onSearchSubmit = () => {
    const { search } = getValues()
    history.push({
      pathname: '/search',
      search: `?term=${search}`
    })
  }
  console.log(data)
  return (
    <>
      <Helmet>
        <title>Restaurants | Grabs Eaters</title>
      </Helmet>
      <form onSubmit={handleSubmit(onSearchSubmit)} className="bg-gray-800 w-full py-28 flex items-center justify-center" style={{ backgroundImage: `url(${HeroBanner})`, backgroundSize: 'cover' }}>
        <input name="search" ref={register({ required: true })} type="search" placeholder="Search for restaurant..." className="input py-2 w-3/4 md:w-4/12" />
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
