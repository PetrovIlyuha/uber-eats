import { faArrowAltCircleDown, faHandPointDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import { log } from 'node:console'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { CreateOrderItemInput, OrderItemOptionInputType } from '../../__api_schema_typed__/globalTypes'
import { ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu } from '../../__api_schema_typed__/ownerSingleRestaurant'
import { restaurant_restaurant_restaurant_menu, restaurant_restaurant_restaurant_menu_options, restaurant_restaurant_restaurant_menu_options_choices } from '../../__api_schema_typed__/restaurant'

interface DishProps {
  dish: ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu | restaurant_restaurant_restaurant_menu;
  isClient?: boolean;
  options?: restaurant_restaurant_restaurant_menu_options[] | null;
  orderStarted?: boolean;
  itemInOrder?: boolean;
  addItemToOrder?: (dishId: number, options: OrderItemOptionInputType[]) => void;
}

type ChoiceExtraPrice = string | number | readonly string[] | undefined

const Dish: React.FC<DishProps> = ({ dish, isClient = false, options = [], itemInOrder, addItemToOrder }) => {
  const [orderWithOptions, setOrderWithOptions] = useState<CreateOrderItemInput>({ dishId: null, options: [] })
  const [currentlyChoosingOptionVariants, setCurrentlyChoosingOptionVariants] = useState<Partial<restaurant_restaurant_restaurant_menu_options_choices>[]>([])

  const addItemOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'None') {
      setCurrentlyChoosingOptionVariants(currentlyChoosingOptionVariants.filter(el => el.name !== e.target.name))
      if (orderWithOptions.options.length) {
        setOrderWithOptions({ ...orderWithOptions, options: [...orderWithOptions.options.filter(op => op.name !== e.target.name)] })
      }
      return
    } else {
      let currentlyChoosingOption = dish?.options?.find(op => op.name === e.target.name)
      let currentChoicePrice = currentlyChoosingOption.choices.find(ch => ch.name === e.target.value).extra
      let updatedChoice: Partial<restaurant_restaurant_restaurant_menu_options_choices> = { name: currentlyChoosingOption.name, extra: currentChoicePrice }
      if (currentlyChoosingOptionVariants.length > 0) {
        const found = currentlyChoosingOptionVariants.find(x => x.name === e.target.name)
        let updatedChoices
        if (found) {
          updatedChoices = currentlyChoosingOptionVariants.map(variant => variant.name === e.target.name ? updatedChoice : variant)
        } else {
          updatedChoices = [...currentlyChoosingOptionVariants, updatedChoice]
        }
        setCurrentlyChoosingOptionVariants(updatedChoices)
      } else {
        setCurrentlyChoosingOptionVariants([updatedChoice])
      }
      if (orderWithOptions.options.length && orderWithOptions.options.find(op => op.name === e.target.name)) {
        setOrderWithOptions({ ...orderWithOptions, options: [...orderWithOptions.options.map(op => op.name === e.target.name ? { ...op, choice: e.target.value } : op)] })
      } else {
        setOrderWithOptions({ dishId: dish.id, options: [...orderWithOptions.options, { name: e.target.name, choice: e.target.value }] })
      }
    }
  }

  const addNewOrderItem = () => {
    if (orderWithOptions.dishId === null) {
      addItemToOrder(dish.id, [])
    } else {
      addItemToOrder(orderWithOptions.dishId, orderWithOptions.options)
    }
  }

  const displayOptionPrice = (name: string) => {
    return currentlyChoosingOptionVariants.find(
      item => item.name === name)
      ? currentlyChoosingOptionVariants.find(
        item => item.name === name).extra
      : 0
  }

  return (
    <div
      className="flex flex-col my-2 mx-2 sm:px-2 lg:px-2 bg-white justify-between rounded-md shadow-sm relative"
      key={dish.id}
    >
      <div className="flex justify-between p-2 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <h2 className="mr-2">{dish.name}</h2>
          <h1 className="font-bold">${dish.price}</h1>
        </div>
        {dish?.photo && (
          <img
            src={dish?.photo}
            className="border-2 border-dashed p-2 border-gray-300 rounded bg-white w-6/12 sm:h-32 sm:w-36 text-gray-200"
            aria-hidden="true"
          />
        )}
      </div>
      {itemInOrder && (
        <motion.div
          initial={{ opacity: 0, rotate: 0, scale: 5, x: -40 }}
          animate={{ opacity: 1, rotate: 45, scale: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute top-6 right-0">
          <span className="text-sm bg-lime-400 px-4 min-w-20 py-2 rounded-md">In Order!</span>
        </motion.div>
      )}
      <div
        className="text-emerald-800 px-2 pb-2 justify-self-start"
      >
        {dish.description}
      </div>
      {isClient && options?.length !== 0 && <div className="mb-5 mt-1">
        <hr />
        <div className="flex justify-between my-2">
          {dish.options && <div className="flex justify-around py-2 bg-gray-200 pl-3 font-semibold text-gray-700 items-center w-7/12">
            <h3 className="text-sm">
              Add to the Dish:
            </h3>
            <FontAwesomeIcon icon={faHandPointDown} color="#418B41" size="2x" className="mx-2" />
          </div>}
          <button type="button" className="py-2 px-4 bg-emerald-500 w-4/12 text-white hover:bg-emerald-800 rounded"
            onClick={addNewOrderItem}
          >
            Add to Order
          </button>
        </div>
        <hr />
        <div className="grid grid-cols-2">
          {options?.map(option => (
            <div key={option.name}>
              <div className="flex w-full mt-3">
                <h5 className="mr-3 font-semibold mb-2">{option.name}</h5>
                <span className="font-bold">$({displayOptionPrice(option.name)})
                </span>
              </div>
              <select
                className="text-sm rounded-md bg-lime-400 px-3 py-2"
                name={option.name}
                onChange={(e) => addItemOption(e)}
              >
                <option defaultValue="none">None</option>
                {option.choices && option.choices.map((choice) => (
                  <option value={choice.name} key={choice.name}>{choice.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>}
    </div>
  )
}

export default Dish
