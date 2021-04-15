import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import Container from '../../components/reusable/Container'
import { restaurant, restaurantVariables } from '../../__api_schema_typed__/restaurant'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Dish from '../../components/restaurants/Dish'
import { CreateOrderItemInput, OrderItemOptionInputType } from '../../__api_schema_typed__/globalTypes'
import { FaSkullCrossbones } from 'react-icons/fa'

interface RestaurantPageProps {
  id: string;
}

const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurauntInput!) {
     restaurant(input: $input) {
      ok
      restaurant {
        name
        id
        coverImage
        address
        menu {
          id
          photo
          description
          name
          price
          options {
            name
            extra
            choices {
              name
              extra
            }
          }
        }
        category {
          name
          coverImage
          id
        }
      }
    }
  }
`

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
     ok
     error
  }
}
`



const Restaurant = () => {
  const { id } = useParams<RestaurantPageProps>()
  const { loading, data } = useQuery<restaurant, restaurantVariables>(RESTAURANT_QUERY, { variables: { input: { restaurantId: Number(id) } } })

  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([])
  const [orderDisplayItems, setOrderDisplayItems] = useState([])
  const addItemToOrder = (itemId: number, options: OrderItemOptionInputType[]) => {
    const alreadyInOrder = orderItems.find(el => el.dishId === itemId)
    const realDish = data?.restaurant?.restaurant?.menu.find(dish => dish.id === itemId)
    let optionsTotalPrice = 0
    let totalDishPrice = realDish.price
    if (options.length) {
      options.forEach(option => {
        let optionPrice = realDish.options.find(op => op.name === option.name).choices.find(ch => ch.name === option.choice).extra
        optionsTotalPrice += optionPrice
      })
    }
    totalDishPrice += optionsTotalPrice
    if (alreadyInOrder) {
      setOrderDisplayItems([...orderDisplayItems.map(item => item.id === itemId ? { ...item, price: totalDishPrice } : item)])
      setOrderItems([...orderItems.map(item => item.dishId === itemId ? { dishId: itemId, options } : item)])
    } else {
      setOrderDisplayItems([...orderDisplayItems, { ...realDish, price: totalDishPrice }])
      setOrderItems([...orderItems, { dishId: itemId, options }])
    }
  }

  const removeItemFromOrder = (itemId: number) => {
    setOrderDisplayItems([...orderDisplayItems.filter(item => item.id !== itemId)])
    setOrderItems([...orderItems.filter(item => item.dishId !== itemId)])
  }

  const itemInOrder = (dishId: number) => {
    return orderItems.some(orderItem => orderItem.dishId === dishId)
  }

  const placeOrder = () => {

  }

  return (
    <Container>
      {!loading && data?.restaurant && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3, }}
          className="bg-emerald-400 py-40 mt-10 shadow-xl"
          style={{ backgroundImage: `url(${data?.restaurant?.restaurant?.coverImage})`, backgroundSize: 'cover' }}
        >
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.35 }}
            className="bg-green-900 py-4 shadow-lg w-4/12 flex justify-center text-white text-2xl flex-col"
          >
            <h4 className="ml-5 text-3xl">{data?.restaurant?.restaurant?.name}</h4>
            <h5 className="text-md ml-5">{data?.restaurant?.restaurant?.address}</h5>
            <h5 className="text-sm ml-5 mt-3 font-light">Kitchen: {` `}
              <Link to={`/category/${data?.restaurant?.restaurant?.category?.name}`}>
                {data?.restaurant?.restaurant?.category?.name}
              </Link>
            </h5>
          </motion.div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="my-10 bg-gray-200 rounded-md shadow-lg flex flex-col"
      >
        <h2 className="text-center text-2xl font-medium pt-8 pb-5">Menu</h2>
        <div className="flex">
          <div className="grid grid-cols-2 w-8/12">
            {data?.restaurant?.restaurant?.menu.map(dish => (
              <Dish
                dish={dish}
                isClient={true}
                options={dish?.options}
                addItemToOrder={addItemToOrder}
                itemInOrder={itemInOrder(dish.id)}
              />
            )
            )}
          </div>
          {orderItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col justify-between border-purple-50 shadow-xl border-2 items-center w-4/12 bg-emerald-900 rounded text-green-300 font-semibold  m-3 pt-4">
              <div className="flex flex-col px-3 items-center">
                <h2 className="mb-3">Order Items:</h2>
                <hr />
                {orderDisplayItems.length > 0 && orderDisplayItems.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    key={idx}
                    className="flex w-full justify-between my-1"
                  >
                    <div className="flex w-9/12 justify-start">
                      <img src={item.photo} className="h-8 mr-2 w-3/12 rounded-sm" alt="item in cart before order" />
                      <h6 className="text-sm w-9/12">{item.name}</h6>
                    </div>
                    <div className="flex ml-4 w-3/12 justify-between">
                      <h5>${item.price}</h5>
                      <FaSkullCrossbones
                        style={{ margin: "3px 0 0 8px", padding: "3px", backgroundColor: 'orange', borderRadius: "50%", color: 'red' }}
                        size={20}
                        onClick={() => removeItemFromOrder(item.id)}
                      />
                    </div>
                  </motion.div>
                ))}
                <div className="border-2 border-gray-400 w-full mt-5"></div>
                <div className="mt-3 w-full text-2xl ml-2">Total per Order: ${orderDisplayItems.reduce((total, next) => next.price + total, 0)}</div>
              </div>
              <button className="btn_base mb-10 px-10 py-4" onClick={placeOrder}>Place Order</button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Container>
  )
}

export default Restaurant
