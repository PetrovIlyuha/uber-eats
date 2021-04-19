import React, { useEffect, useState } from "react";
import gql from "graphql-tag";
import { useMutation, useQuery } from "@apollo/client";
import { useHistory, useParams } from "react-router";
import Container from "../../components/reusable/Container";
import {
  restaurant,
  restaurantVariables,
} from "../../__api_schema_typed__/restaurant";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Dish from "../../components/restaurants/Dish";
import Modal from "../../components/reusable/Modal";
import {
  CreateOrderItemInput,
  OrderItemOptionInputType,
} from "../../__api_schema_typed__/globalTypes";
import { FaSkullCrossbones } from "react-icons/fa";
import { restaurant_restaurant_restaurant_menu } from "../../__api_schema_typed__/restaurant";
import Carousel from "react-gallery-carousel";
import "react-gallery-carousel/dist/index.css";
import cogoToast from "cogo-toast";
import {
  createOrder,
  createOrderVariables,
} from "../../__api_schema_typed__/createOrder";

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
`;

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ok
      orderId
      error
    }
  }
`;

const Restaurant = () => {
  const { id } = useParams<RestaurantPageProps>();
  const history = useHistory();
  const { loading, data } = useQuery<restaurant, restaurantVariables>(
    RESTAURANT_QUERY,
    { variables: { input: { restaurantId: Number(id) } } }
  );
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([]);
  const [orderDisplayItems, setOrderDisplayItems] = useState([]);
  const [fullOrderItemsInfo, setFullOrderItemsInfo] = useState<
    restaurant_restaurant_restaurant_menu[]
  >([]);
  const [fullOrderImages, setFullOrderImages] = useState<{ src: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const orderCreationCompleted = (data: createOrder) => {
    if (data.createOrder.ok) {
      const {
        createOrder: { ok, error, orderId },
      } = data;
      cogoToast.success("Order was created! 🍔🍕🍝");
      cancelOrClearOnCompleteOrder();
      setShowConfirmModal(false);
      history.push(`/orders/${orderId}`);
    }
  };

  const [makingOrder, { loading: createOrderLoading }] = useMutation<
    createOrder,
    createOrderVariables
  >(CREATE_ORDER_MUTATION, { onCompleted: orderCreationCompleted });

  const addItemToOrder = (
    itemId: number,
    options: OrderItemOptionInputType[]
  ) => {
    const alreadyInOrder = orderItems.find((el) => el.dishId === itemId);
    const realDish = data?.restaurant?.restaurant?.menu.find(
      (dish) => dish.id === itemId
    );
    let optionsTotalPrice = 0;
    let totalDishPrice = realDish.price;
    if (options.length) {
      options.forEach((option) => {
        let optionPrice = realDish.options
          .find((op) => op.name === option.name)
          .choices.find((ch) => ch.name === option.choice).extra;
        optionsTotalPrice += optionPrice;
      });
    }
    totalDishPrice += optionsTotalPrice;
    if (alreadyInOrder) {
      setOrderDisplayItems([
        ...orderDisplayItems.map((item) =>
          item.id === itemId ? { ...item, price: totalDishPrice } : item
        ),
      ]);
      setOrderItems([
        ...orderItems.map((item) =>
          item.dishId === itemId ? { dishId: itemId, options } : item
        ),
      ]);
    } else {
      setFullOrderItemsInfo([...fullOrderItemsInfo, realDish]);
      setOrderDisplayItems([
        ...orderDisplayItems,
        { ...realDish, price: totalDishPrice },
      ]);
      setFullOrderImages([...fullOrderImages, { src: realDish.photo }]);
      setOrderItems([...orderItems, { dishId: itemId, options }]);
    }
  };

  const removeItemFromOrder = (itemId: number) => {
    setOrderDisplayItems([
      ...orderDisplayItems.filter((item) => item.id !== itemId),
    ]);
    setOrderItems([...orderItems.filter((item) => item.dishId !== itemId)]);
    setFullOrderItemsInfo([
      ...fullOrderItemsInfo.filter((item) => item.id !== itemId),
    ]);
    const realDish = data?.restaurant?.restaurant?.menu.find(
      (dish) => dish.id === itemId
    );
    setFullOrderImages([
      ...fullOrderImages.filter((img) => img.src !== realDish.photo),
    ]);
    if (fullOrderItemsInfo.length === 1) {
      cancelOrClearOnCompleteOrder();
      setShowConfirmModal(false);
    }
  };

  const itemInOrder = (dishId: number) => {
    return orderItems.some((orderItem) => orderItem.dishId === dishId);
  };

  const placeOrder = () => {
    setShowConfirmModal(true);
  };

  const cancelOrClearOnCompleteOrder = () => {
    setOrderItems([]);
    setFullOrderItemsInfo([]);
    setOrderDisplayItems([]);
    setFullOrderImages([]);
  };

  const confirmOrderAndCreate = () => {
    if (createOrderLoading) {
      cogoToast.error("Wait the other order to be processed!");
      return;
    }
    const order = {
      restaurantId: data?.restaurant?.restaurant.id,
      items: orderItems,
    };
    console.log(order);
    makingOrder({ variables: { input: order } });
  };

  return (
    <Container>
      {!loading && data?.restaurant && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-emerald-400 py-40 mt-10 shadow-xl"
          style={{
            backgroundImage: `url(${data?.restaurant?.restaurant?.coverImage})`,
            backgroundSize: "cover",
          }}
        >
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.35 }}
            className="bg-green-900 py-4 shadow-lg w-4/12 flex justify-center text-white text-2xl flex-col"
          >
            <h4 className="ml-5 text-3xl">
              {data?.restaurant?.restaurant?.name}
            </h4>
            <h5 className="text-md ml-5">
              {data?.restaurant?.restaurant?.address}
            </h5>
            <h5 className="text-sm ml-5 mt-3 font-light">
              Kitchen: {` `}
              <Link
                to={`/category/${data?.restaurant?.restaurant?.category?.name}`}
              >
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
          <div
            className={
              orderItems.length > 0
                ? "grid grid-cols-2 w-8/12"
                : "grid grid-cols-3 w-full"
            }
          >
            {data?.restaurant?.restaurant?.menu.map((dish) => (
              <Dish
                dish={dish}
                isClient={true}
                options={dish?.options}
                addItemToOrder={addItemToOrder}
                itemInOrder={itemInOrder(dish.id)}
              />
            ))}
          </div>
          {orderItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col justify-between border-purple-50 shadow-xl border-2 items-center w-4/12 bg-emerald-900 rounded text-green-300 font-semibold  m-3 pt-4"
            >
              <div className="flex flex-col px-3 items-center">
                <h2 className="mb-3">Order Items:</h2>
                <hr />
                {orderDisplayItems.length > 0 &&
                  orderDisplayItems.map((item, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      key={idx}
                      className="flex w-full justify-between my-1"
                    >
                      <div className="flex w-9/12 justify-start">
                        <img
                          src={item.photo}
                          className="h-8 mr-2 w-3/12 rounded-sm"
                          alt="item in cart before order"
                        />
                        <h6 className="text-sm w-9/12">{item.name}</h6>
                      </div>
                      <div className="flex ml-4 w-3/12 justify-between">
                        <h5>${item.price}</h5>
                        <FaSkullCrossbones
                          style={{
                            margin: "3px 0 0 8px",
                            padding: "3px",
                            backgroundColor: "orange",
                            borderRadius: "50%",
                            color: "red",
                          }}
                          size={20}
                          onClick={() => removeItemFromOrder(item.id)}
                        />
                      </div>
                    </motion.div>
                  ))}
                <div className="border-2 border-gray-400 w-full mt-5"></div>
                <div className="mt-3 w-full text-2xl ml-2">
                  Total per Order: $
                  {orderDisplayItems.reduce(
                    (total, next) => next.price + total,
                    0
                  )}
                </div>
              </div>
              <div className="flex w-full justify-around">
                <button
                  className="btn_base mb-10 px-5 py-4 bg-red-400 text-white hover:bg-red-500"
                  onClick={cancelOrClearOnCompleteOrder}
                >
                  Cancel Order
                </button>
                <button
                  className="btn_base mb-10 px-5 py-4"
                  onClick={placeOrder}
                >
                  Place Order
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      <Modal setShowModal={setShowConfirmModal} showModal={showConfirmModal}>
        <h3 className="text-2xl mb-10">Ready to Order?</h3>
        <div className="flex w-full">
          <Carousel
            images={fullOrderImages}
            style={{
              height: 380,
              width: "160%",
              border: "3px solid grey",
              padding: "10px",
              boxShadow: "3px 3px 20px -5px rgba(0,0,0,0.3)",
              backgroundColor: "lightyellow",
              borderRadius: "5px",
            }}
          />
          <div className="flex flex-col ml-10">
            <h2 className="text-center text-xl mb-4 font-bold">
              Check order Details
            </h2>
            {fullOrderItemsInfo.length > 0 &&
              fullOrderItemsInfo.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  key={idx}
                  className="flex w-full justify-between my-1"
                >
                  <div className="flex w-9/12 justify-start">
                    <img
                      src={item.photo}
                      className="h-18 mr-2 w-3/12 rounded-sm"
                      alt="item in cart before order"
                    />
                    <h6 className="text-sm w-9/12">{item.name}</h6>
                  </div>
                  <div className="flex ml-4 w-3/12 justify-between">
                    <h5>${item.price}</h5>
                    <FaSkullCrossbones
                      style={{
                        margin: "3px 0 0 8px",
                        padding: "3px",
                        backgroundColor: "orange",
                        borderRadius: "50%",
                        color: "red",
                      }}
                      size={20}
                      onClick={() => removeItemFromOrder(item.id)}
                    />
                  </div>
                </motion.div>
              ))}
            <hr />
            <div className="mt-3 w-full text-2xl font-semibold ml-2">
              Total Price: $
              {fullOrderItemsInfo.reduce(
                (total, next) => next.price + total,
                0
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-around mt-10">
          <button
            className="btn_base mb-10 px-5 py-4 bg-red-400 text-white hover:bg-red-500"
            onClick={() => {
              cancelOrClearOnCompleteOrder();
              setShowConfirmModal(false);
            }}
          >
            Cancel Order
          </button>
          <button
            className="btn_base mb-10 px-5 py-4"
            onClick={confirmOrderAndCreate}
          >
            Confirm & Order
          </button>
        </div>
      </Modal>
    </Container>
  );
};

export default Restaurant;
