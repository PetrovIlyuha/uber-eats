import {
  faHandPointDown,
  faHandPointUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import {
  CreateOrderItemInput,
  OrderItemOptionInputType,
} from "../../__api_schema_typed__/globalTypes";
import { ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu } from "../../__api_schema_typed__/ownerSingleRestaurant";
import {
  restaurant_restaurant_restaurant_menu,
  restaurant_restaurant_restaurant_menu_options,
  restaurant_restaurant_restaurant_menu_options_choices,
} from "../../__api_schema_typed__/restaurant";

interface DishProps {
  dish:
    | ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu
    | restaurant_restaurant_restaurant_menu;
  isClient?: boolean;
  options?: restaurant_restaurant_restaurant_menu_options[] | null;
  orderStarted?: boolean;
  itemInOrder?: boolean;
  addItemToOrder?: (
    dishId: number,
    options: OrderItemOptionInputType[]
  ) => void;
}

const Dish: React.FC<DishProps> = ({
  dish,
  isClient = false,
  options = [],
  itemInOrder,
  addItemToOrder,
}) => {
  const [
    orderWithOptions,
    setOrderWithOptions,
  ] = useState<CreateOrderItemInput>({ dishId: null, options: [] });
  const [
    currentlyChoosingOptionVariants,
    setCurrentlyChoosingOptionVariants,
  ] = useState<
    Partial<restaurant_restaurant_restaurant_menu_options_choices>[]
  >([]);
  const [animateIntervals, setAnimateIntervals] = useState({});
  const [showOptions, setShowOptions] = useState(false);

  const addItemOption = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnimateIntervals({ ...animateIntervals, [e.target.name]: true });
    if (e.target.value === "None") {
      setCurrentlyChoosingOptionVariants(
        currentlyChoosingOptionVariants.filter(
          (el) => el.name !== e.target.name
        )
      );
      if (orderWithOptions.options.length) {
        setOrderWithOptions({
          ...orderWithOptions,
          options: [
            ...orderWithOptions.options.filter(
              (op) => op.name !== e.target.name
            ),
          ],
        });
      }
      return;
    } else {
      let currentlyChoosingOption = dish?.options?.find(
        (op) => op.name === e.target.name
      );
      let currentChoicePrice = currentlyChoosingOption.choices.find(
        (ch) => ch.name === e.target.value
      ).extra;
      let updatedChoice: Partial<restaurant_restaurant_restaurant_menu_options_choices> = {
        name: currentlyChoosingOption.name,
        extra: currentChoicePrice,
      };
      if (currentlyChoosingOptionVariants.length > 0) {
        const found = currentlyChoosingOptionVariants.find(
          (x) => x.name === e.target.name
        );
        let updatedChoices;
        if (found) {
          updatedChoices = currentlyChoosingOptionVariants.map((variant) =>
            variant.name === e.target.name ? updatedChoice : variant
          );
        } else {
          updatedChoices = [...currentlyChoosingOptionVariants, updatedChoice];
        }
        setCurrentlyChoosingOptionVariants(updatedChoices);
      } else {
        setCurrentlyChoosingOptionVariants([updatedChoice]);
      }
      const optionIsAdded = orderWithOptions.options.find(
        (op) => op.name === e.target.name
      );
      if (orderWithOptions.options.length && optionIsAdded) {
        setOrderWithOptions({
          ...orderWithOptions,
          options: [
            ...orderWithOptions.options.map((op) =>
              op.name === e.target.name ? { ...op, choice: e.target.value } : op
            ),
          ],
        });
      } else {
        setOrderWithOptions({
          dishId: dish.id,
          options: [
            ...orderWithOptions.options,
            { name: e.target.name, choice: e.target.value },
          ],
        });
      }
    }
    setTimeout(() => {
      setAnimateIntervals({ ...animateIntervals, [e.target.name]: false });
    }, 200);
  };

  const addNewOrderItem = () => {
    if (orderWithOptions.dishId === null) {
      addItemToOrder(dish.id, []);
    } else {
      addItemToOrder(orderWithOptions.dishId, orderWithOptions.options);
    }
  };

  const displayOptionPrice = (name: string) => {
    return currentlyChoosingOptionVariants.find((item) => item.name === name)
      ? currentlyChoosingOptionVariants.find((item) => item.name === name).extra
      : 0;
  };

  const getKeyValue = <T extends object, U extends keyof T>(key: U) => (
    obj: T
  ) => obj[key];

  const isOptionSelected = (name: string) => {
    return orderWithOptions.options.find((op) => op.name === name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 2 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      exit={{ opacity: 0, scale: 0.2 }}
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
          className="absolute top-6 right-0"
        >
          <span className="text-sm bg-lime-400 px-4 min-w-20 py-2 rounded-md">
            In Order!
          </span>
        </motion.div>
      )}
      <div className="text-emerald-800 px-2 pb-2 justify-self-start">
        {dish.description}
      </div>
      {isClient && options?.length !== 0 && !itemInOrder && (
        <div className="mb-5 mt-1">
          <hr />
          <div
            className="flex justify-between my-2 z-10"
            onClick={() => setShowOptions((prev) => !prev)}
          >
            {dish.options && (
              <div className="flex justify-around py-2 bg-gray-200 pl-3 font-semibold text-gray-700 items-center w-7/12 cursor-pointer">
                <h3 className="text-sm">Add to the Dish:</h3>
                <AnimatePresence initial={false}>
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { rotate: 180 },
                      collapsed: { rotate: 0 },
                    }}
                    transition={{ duration: 1, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <FontAwesomeIcon
                      icon={showOptions ? faHandPointDown : faHandPointUp}
                      color="#418B41"
                      size="2x"
                      className="mx-2"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
            {!itemInOrder && (
              <button
                type="button"
                className="py-2 px-4 bg-emerald-500 w-4/12 text-white hover:bg-emerald-800 rounded disabled:opacity-50"
                disabled={itemInOrder}
                onClick={addNewOrderItem}
              >
                Add to Order
              </button>
            )}
          </div>
          <hr />
          <AnimatePresence initial={false}>
            {showOptions && (
              <motion.div
                className={showOptions ? "grid grid-cols-2" : "hidden"}
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { opacity: 1, y: 0 },
                  collapsed: { opacity: 0, y: -100 },
                }}
                transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                {options?.map((option) => (
                  <div key={option.name}>
                    <div
                      className={
                        getKeyValue(option.name as never)(animateIntervals)
                          ? "flex w-full mt-3 transform scale-110 transition-all duration-150"
                          : "flex w-full mt-3 transform scale-100"
                      }
                    >
                      <h5 className="mr-3 font-semibold mb-2">{option.name}</h5>
                      <span className="font-bold">
                        $({displayOptionPrice(option.name)})
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        className={
                          isOptionSelected(option.name)
                            ? "text-sm rounded-md bg-lime-800 text-white px-3 py-2 cursor-pointer"
                            : "text-sm rounded-md bg-lime-400 px-3 py-2 cursor-pointer"
                        }
                        name={option.name}
                        onChange={(e) => addItemOption(e)}
                      >
                        <option defaultValue="none">None</option>
                        {option.choices &&
                          option.choices.map((choice) => (
                            <option value={choice.name} key={choice.name}>
                              {choice.name}
                            </option>
                          ))}
                      </select>
                      {isOptionSelected(option.name) && (
                        <motion.span
                          initial={{ opacity: 0, rotate: 0, scale: 5, x: -40 }}
                          animate={{ opacity: 1, rotate: 45, scale: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="absolute top-2 right-2 bg-blue-400 text-white p-1 rounded text-xs"
                        >
                          Selected
                        </motion.span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Dish;
