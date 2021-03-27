import React from 'react'
import { Link } from 'react-router-dom'
import { restaurantsPageQuery_allCategories_categories } from '../../__api_schema_typed__/restaurantsPageQuery'

interface CategoriesData {
  data: restaurantsPageQuery_allCategories_categories[] | null
}

const CategoriesIconsBar: React.FC<CategoriesData> = ({ data }) => {
  return (
    <div className="mt-8 flex justify-around max-w-xs mx-auto">
      {data?.map(category => (
        <Link to={`/category/${category.slug}`} key={category.id}>
          <div className="flex flex-col items-center group cursor-pointer">
            <div key={category.id} className="lg:w-14 lg:h-14 md:w-12 md:h-12 w-10 h-10 rounded-full bg-cover transition-all duration-75 transform hover:scale-110" style={{ backgroundImage: `url(${category.coverImage})` }}></div>
            <span className="text-sm mt-2 p-1 text-center rounded-b-lg group-hover:bg-emerald-400 group-hover:text-gray-100 font-medium">{category.name}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default CategoriesIconsBar
