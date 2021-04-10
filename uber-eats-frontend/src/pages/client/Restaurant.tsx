import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import Container from '../../components/reusable/Container'
import { restaurant, restaurantVariables, restaurant_restaurant_restaurant_menu } from '../../__api_schema_typed__/restaurant'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Dish from '../../components/restaurants/Dish'
import { CreateOrderItemInput, OrderItemOptionInputType } from '../../__api_schema_typed__/globalTypes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCross, faTrash } from '@fortawesome/free-solid-svg-icons'
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
  // console.log(data);
  const [orderStarted, setOrderStarted] = useState(false)
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([])
  const [orderDisplayItems, setOrderDisplayItems] = useState([])
  const startCollectOrder = () => {
    setOrderStarted(true)
  }

  const addItemToOrder = (itemId: number, options: OrderItemOptionInputType[]) => {
    const alreadyInOrder = orderItems.find(el => el.dishId === itemId)
    let realDishExtraPrice: number;
    const realDish = data?.restaurant?.restaurant?.menu.find(dish => dish.id === itemId)
    console.log(options)
    if (options[0].choice !== 'None') {
      realDishExtraPrice = data?.restaurant?.restaurant?.menu.find(dish => dish.id === itemId)
        .options.find(op => op.name === options[0].name)
        .choices.find(ch => ch.name === options[0].choice).extra
    } else {
      realDishExtraPrice = 0
    }

    if (alreadyInOrder) {
      setOrderDisplayItems([...orderDisplayItems.map(item => item.id === itemId ? { ...item, price: realDish.price + realDishExtraPrice } : item)])
      setOrderItems([...orderItems.map(item => item.dishId === itemId ? { dishId: itemId, options } : item)])
    } else {
      setOrderDisplayItems([...orderDisplayItems, { ...realDish, price: realDish.price + realDishExtraPrice }])
      setOrderItems([...orderItems, { dishId: itemId, options }])
    }
  }
  console.log(orderDisplayItems)

  const removeItemFromOrder = (itemId: number) => {
    setOrderDisplayItems([...orderDisplayItems.filter(item => item.id !== itemId)])
    setOrderItems([...orderItems.filter(item => item.dishId !== itemId)])
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1 }} className="my-10 bg-gray-200 rounded-md shadow-lg flex flex-col">
        <h2 className="text-center text-2xl font-medium pt-8 pb-5">Menu</h2>
        <button
          type="button"
          className="py-2 px-4 bg-emerald-600 text-white rounded-sm w-2/12 ml-auto mr-12 mb-3 shadow-md hover:shadow-lg hover:bg-emerald-800 transition-all duration-200"
          onClick={startCollectOrder}
        >
          Start Ordering
        </button>
        <div className="flex">
          <div className="grid grid-cols-2 w-8/12">
            {data?.restaurant?.restaurant?.menu.map(dish => (
              <Dish dish={dish} isClient={true} options={dish.options} orderStarted={orderStarted} addItemToOrder={addItemToOrder} />
            )
            )}
          </div>
          {orderStarted && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col border-purple-50 shadow-xl border-2 items-center w-4/12 bg-emerald-900 rounded text-green-300 font-semibold  m-3 pt-4">
              <h2 className="mb-3">Order Items:</h2>
              <hr />
              {orderDisplayItems.length > 0 && orderDisplayItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  key={idx}
                  className="flex w-full justify-between px-3 my-1"
                >
                  <div className="flex">
                    <img src={item.photo} className="h-8 mr-2" alt="item in cart before order" />
                    <h6 className="text-sm">{item.name}</h6>
                  </div>
                  <div className="flex ml-4 w-2/12 justify-between">
                    <h5>${item.price}</h5>
                    <FaSkullCrossbones
                      style={{ margin: "3px 0 0 8px", padding: "3px", backgroundColor: 'orange', borderRadius: "50%", color: 'red' }}
                      size={20}
                      onClick={() => removeItemFromOrder(item.id)}
                    />
                  </div>
                </motion.div>
              ))}
              <div className="border-2 border-gray-400 w-8/12 mt-2"></div>
              <div className="mt-3 w-6/12">Total per Order: ${orderDisplayItems.reduce((total, next) => next.price + total, 0)}</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Container>
  )
}

export default Restaurant
