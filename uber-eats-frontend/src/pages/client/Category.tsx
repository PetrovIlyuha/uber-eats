import { useLazyQuery } from '@apollo/client'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const CATEGORY_QUERY = gql`
 query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      category {
        id
        name
        coverImage
        restaurantCount
        restaurants {
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
  const [loadCategory, { loading, error, data }] = useLazyQuery(CATEGORY_QUERY)
  useEffect(() => {
    const slug = params?.slug
    if (slug) {
      loadCategory({ variables: { input: { page: 1, slug } } })
    }
  }, [params])
  console.log(loading, error, data)
  return (
    <div>
      Category
    </div>
  )
}

export default Category
