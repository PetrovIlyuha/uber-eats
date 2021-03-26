import React from 'react'

interface RestaurantProps {
  id: string;
  coverImage: string;
  name: string;
  categoryName?: string;
}

const Restaurant: React.FC<RestaurantProps> = ({ id, coverImage, name, categoryName }) => {
  return (
    <div className="flex flex-col">
      <div className="py-28 bg-cover mb-3" style={{ backgroundImage: `url(${coverImage})` }}></div>
      <h3 className="font-medium">{name}</h3>
      <span className="font-semibold border-t-2 border-gray-300 w-full text-xs py-2 mt-3">Kitchen: {categoryName}</span>
    </div>
  )
}

export default Restaurant
