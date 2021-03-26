import React from 'react'
import { BiLeftArrowCircle, BiRightArrowCircle } from 'react-icons/bi'
import { restaurantsPageQuery } from '../../__api_schema_typed__/restaurantsPageQuery'

interface PaginationProps {
  page: number;
  data: restaurantsPageQuery,
  changeToNextPage: (event: React.MouseEvent<SVGElement>) => void
  changeToPrevPage: (event: React.MouseEvent<SVGElement>) => void;
}

const RestaurantsPaginator: React.FC<PaginationProps> = ({ page, data, changeToNextPage, changeToPrevPage }) => {
  return (
    <div className="flex flex-col items-center my-10">
      <span className="font-semibold">Page {page} of {data.restaurants.totalPages}</span>
      {page !== data?.restaurants.totalPages &&
        <BiRightArrowCircle onClick={changeToNextPage} className="animate-pulse cursor-pointer" size={30} color="green" />}
      {page > 1 && (
        <BiLeftArrowCircle onClick={changeToPrevPage} className="animate-pulse cursor-pointer" size={30} color="green" />
      )}
    </div>
  )
}

export default RestaurantsPaginator
