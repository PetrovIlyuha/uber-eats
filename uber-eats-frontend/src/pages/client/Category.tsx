import React, { useEffect, useState } from 'react'
import gql from 'graphql-tag'
import { useLazyQuery } from '@apollo/client'
import { Link, useParams } from 'react-router-dom'
import { category, categoryVariables } from '../../__api_schema_typed__/category'
import Container from '../../components/reusable/Container'
import RestaurantsPaginator from '../../components/reusable/RestaurantsPaginator'
import Restaurant from '../../components/restaurants/Restaurant'

const CATEGORY_QUERY = gql`
 query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      category {
        id
        name
        coverImage
        restaurantCount
        restaurants {
          id
          name
          coverImage
          address
        }
      }
    }
  }
`

interface CategoryProps {
  slug: string
}

const Category = () => {
  const params = useParams<CategoryProps>()
  const [page, setPage] = useState<number>(1)
  const [loadCategory, { loading, error, data }] = useLazyQuery<category, categoryVariables>(CATEGORY_QUERY)
  useEffect(() => {
    const slug = params?.slug
    if (slug) {
      loadCategory({ variables: { input: { page: 1, slug } } })
    }
  }, [params])
  console.log(loading, error, data)

  const changeToNextPage = () => {
    setPage(page => page + 1)
  }
  const changeToPrevPage = () => {
    setPage(page => page - 1)
  }

  return (
    <Container>
      {!loading && data?.category?.category && (
        <div className="flex flex-col">
          <div className="flex mx-auto mt-10 items-center">
            <img src={data?.category?.category?.coverImage} alt="category image" className="w-20 h-20 rounded-full mr-10 shadow-lg" />
            <h2 className="text-2xl">All {data?.category?.category?.name.split('').map((letter, idx) => idx === 0 ? letter.toUpperCase() : letter).join("")} Restaurants</h2>
          </div>
          {/* <RestaurantsPaginator
            data={data.category.category.restaurants}
            page={page}
            changeToNextPage={changeToNextPage}
            changeToPrevPage={changeToPrevPage}
          /> */}
          <div className="mt-10 grid lg:grid-cols-3 md:grid-cols-2 gap-x-5 gap-y-10">
            {data?.category?.category?.restaurants?.map((restaurant, idx) => (
              <Link to={`/restaurant/${restaurant?.id}`}>
                <Restaurant
                  key={restaurant?.id}
                  coverImage={restaurant?.coverImage}
                  name={restaurant?.name}
                  categoryName={data?.category?.category?.name}
                />
              </Link>
            ))}
          </div>
          {/* <RestaurantsPaginator
            data={data}
            page={page}
            changeToNextPage={changeToNextPage}
            changeToPrevPage={changeToPrevPage}
          /> */}
        </div>
      )}
    </Container>
  )
}

export default Category
