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
  addItemToOrder?: (dishId: number, options: OrderItemOptionInputType[]) => void;
}

type ChoiceExtraPrice = string | number | readonly string[] | undefined

const Dish: React.FC<DishProps> = ({ dish, isClient = false, options = [], orderStarted, addItemToOrder }) => {
  const [orderWithOptions, setOrderWithOptions] = useState<CreateOrderItemInput>(null)
  const [optionsPrice, setOptionsPrice] = useState<number>(0)

  const addItemOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'None') {
      setOptionsPrice(0)
    } else {
      const optionsPrice = options.find(op => op.name === e.target.name).choices.find(ch => ch.name === e.target.value).extra
      setOptionsPrice(optionsPrice)
    }
    setOrderWithOptions({ ...orderWithOptions, dishId: dish.id, options: [{ name: e.target.name, choice: e.target.value }] })
  }

  const addNewOrderItem = () => {
    if (!orderWithOptions) {
      addItemToOrder(dish.id, [{ name: "none", choice: 'None' }])
    } else {
      addItemToOrder(orderWithOptions.dishId, orderWithOptions.options)
    }
    console.log(orderWithOptions)
  }

  return (
    <div className="flex flex-col my-2 mx-2 sm:px-2 lg:px-2 bg-white justify-between rounded-md shadow-sm" key={dish.id}>
      <div className="flex justify-between p-2 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <h2 className="mr-2">{dish.name}</h2>
          <h1 className="font-bold">${dish.price}</h1>
        </div>
        {dish?.photo && (
          <img src={dish?.photo} className="border-2 border-dashed p-2 border-gray-300 rounded bg-white w-6/12 sm:h-32 sm:w-36 text-gray-200" aria-hidden="true" />
        )}
      </div>
      <div className="text-emerald-800 px-2 pb-2 justify-self-start">{dish.description}</div>
      {isClient && options.length !== 0 && <div className="mb-5 mt-1">
        <hr />
        <div className="flex justify-between my-2">
          <h3 className="py-2 bg-gray-400 pl-3 font-semibold text-white w-7/12">Add Optional:</h3>
          {orderStarted && <button type="button" className="py-2 px-4 bg-emerald-500 w-4/12 text-white hover:bg-emerald-800 rounded" onClick={addNewOrderItem}>Order</button>}
        </div>
        <hr />
        <div className="flex flex-col items-left">
          {options.map(option => (
            <div key={option.name}>
              <div className="flex w-full mt-3">
                <h5 className="mr-3">{option.name}</h5>
                <span>$({option.extra || optionsPrice})</span>
              </div>
              <select
                className="text-sm"
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
