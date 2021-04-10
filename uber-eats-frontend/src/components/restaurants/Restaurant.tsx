import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import React, { useEffect } from 'react'

interface RestaurantProps {
  coverImage: string;
  name: string;
  categoryName?: string;
}

const Restaurant: React.FC<RestaurantProps> = ({ coverImage, name, categoryName }) => {
  const [ref, inView] = useInView({
    threshold: 0.35
  });
  return (
    <motion.div
      ref={ref}
      animate={{ opacity: inView ? 1 : 0, x: inView ? -30 : 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: "backOut" }}
      className="flex flex-col"
    >
      <motion.div
        className="py-28 bg-cover mb-3"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1, transition: { duration: 0.1 } }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        style={{ backgroundImage: `url(${coverImage})` }}>
      </motion.div>
      <h3 className="font-medium">{name}</h3>
      <span className="font-semibold border-t-2 border-gray-300 w-full text-xs py-2 mt-3">Kitchen: {categoryName}</span>
    </motion.div>
  )
}

export default Restaurant
