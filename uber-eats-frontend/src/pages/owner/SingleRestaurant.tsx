import { useQuery, useSubscription } from "@apollo/client";
import { motion } from "framer-motion";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
} from "victory";
import { useInView } from "react-intersection-observer";
import { BiDish } from "react-icons/bi";
import { RiAdvertisementLine } from "react-icons/ri";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import Dish from "../../components/restaurants/Dish";
import Container from "../../components/reusable/Container";
import SpinnerBasic from "../../components/reusable/SpinnerBasic";
import {
  ownerSingleRestaurant,
  ownerSingleRestaurantVariables,
  ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu,
} from "../../__api_schema_typed__/ownerSingleRestaurant";
import { sortOrdersByDateTotal } from "./utils";
import { pendingOrders } from "../../__api_schema_typed__/pendingOrders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import cogoToast from "cogo-toast";

export const QUERY_MY_RESTAURANT = gql`
  query ownerSingleRestaurant($input: OwnerRestaurantInput!) {
    ownersSingleRestaurant(input: $input) {
      ok
      error
      restaurant {
        id
        createdAt
        name
        coverImage
        address
        category {
          name
          id
          coverImage
          slug
        }
        isPromoted
        promotionActiveUntil
        menu {
          id
          name
          price
          photo
          description
          options {
            name
            extra
            choices {
              name
              extra
            }
          }
        }
        orders {
          createdAt
          customer {
            id
            email
          }
          total
          items {
            dish {
              name
              price
              options {
                id
                name
                extra
                choices {
                  id
                  name
                  extra
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PENDING_ORDERS_SUB = gql`
  subscription pendingOrders {
    pendingOrders {
      id
      total
      items {
        id
        dish {
          name
          price
          photo
          description
        }
        options {
          name
          choice
        }
      }
      createdAt
      updatedAt
      customer {
        email
      }
      driver {
        email
      }
    }
  }
`;

const SingleRestaurant = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [ref, inView] = useInView({
    threshold: 1,
  });
  const [newOrderNotification, setNewOrderNotification] = useState<boolean>(
    false
  );
  const { data, loading } = useQuery<
    ownerSingleRestaurant,
    ownerSingleRestaurantVariables
  >(QUERY_MY_RESTAURANT, { variables: { input: { id: +id } } });

  const { data: pendingOrdersData } = useSubscription<pendingOrders>(
    PENDING_ORDERS_SUB
  );

  useEffect(() => {
    if (pendingOrdersData?.pendingOrders.id) {
      setNewOrderNotification(true);
      cogoToast.success("You've got new Order!");
    }
  }, [pendingOrdersData?.pendingOrders?.id]);

  const goCheckOrder = () => {
    history.push(`/orders/${pendingOrdersData?.pendingOrders.id}`);
  };
  return (
    <div className="bg-gray-100 max-h-full">
      <Container>
        {loading && (
          <div className="h-screen flex flex-col">
            <div className="mt-72 justify-self-center place-items-center">
              <h2 className="text-center mb-10 text-2xl animate-pulse pl-2">
                Loading...
              </h2>
              <SpinnerBasic />
            </div>
          </div>
        )}
        {!loading && data?.ownersSingleRestaurant?.restaurant && (
          <div className="flex flex-col relative top-0">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                background: `url(${data?.ownersSingleRestaurant?.restaurant?.coverImage})`,
                objectFit: "cover",
              }}
              className="h-full shadow-xl py-32"
            />
            <motion.h2
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="mt-10 bg-green-200 rounded-sm py-2 pl-4 text-xl italic"
            >
              {data.ownersSingleRestaurant.restaurant.name}
            </motion.h2>
            <motion.div
              className="flex w-full justify-between md:justify-around"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {newOrderNotification && (
                <motion.button
                  onClick={goCheckOrder}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-blue-400 shadow-md hover:bg-blue-700 hover:shadow-lg rounded-full h-20 w-20 p-3 mt-10 font-bold text-white transition-all duration-200"
                >
                  <span>
                    <FontAwesomeIcon
                      icon={faBell}
                      size="2x"
                      color="yellow"
                      className="animate-bounce"
                    />
                  </span>
                  <p className="text-xs">New Order </p>
                </motion.button>
              )}
              <Link
                to={`/restaurant/${data?.ownersSingleRestaurant?.restaurant.id}/addMenuItem`}
              >
                <button className="btn_base py-2 px-4 mx-2 h-16 bg-blue-400 hover:bg-blue-600 mt-10 font-bold text-lg flex items-center justify-between transition-colors">
                  <BiDish
                    className="animate-pulse mr-4"
                    size={30}
                    color="white"
                  />
                  <span className="animate-pulse">Add</span>
                </button>
              </Link>
              <Link to="/buy-promotion">
                <button className="btn_base py-1 mt-10 h-16 sm:px-4 text-md bg-yellow-300 hover:bg-yellow-400 font-bold md:text-lg text-black flex items-center justify-between transition-colors">
                  <RiAdvertisementLine
                    className="animate-pulse mr-4"
                    size={60}
                  />
                  <span className="animate-pulse">Promote your restaurant</span>
                </button>
              </Link>
            </motion.div>
            <div className="h-screen">
              {data?.ownersSingleRestaurant?.restaurant?.menu.length === 0 ? (
                <h3 className="ml-32 mt-4">Now you can create the menu</h3>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1 }}
                  className="my-10 bg-gray-200 rounded-md shadow-lg"
                >
                  <h2 className="text-center text-2xl font-medium pt-8 pb-5">
                    Menu
                  </h2>
                  <div className="grid lg:grid-cols-3 md:grid-cols-2">
                    {data?.ownersSingleRestaurant?.restaurant?.menu.map(
                      (
                        dish: ownerSingleRestaurant_ownersSingleRestaurant_restaurant_menu
                      ) => (
                        <Dish dish={dish} key={dish.id} />
                      )
                    )}
                  </div>
                </motion.div>
              )}
              <motion.div
                className="mt-12"
                ref={ref}
                animate={{ opacity: inView ? 1 : 0 }}
              >
                <h2 className="text-center text-2xl font-medium">Sales</h2>
                <div className="mx-20">
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={30}
                    width={window?.innerWidth - 200}
                    height={400}
                    containerComponent={<VictoryVoronoiContainer />}
                  >
                    <VictoryLine
                      labels={({ datum }) => `$${parseInt(datum.y)}`}
                      labelComponent={
                        <VictoryTooltip
                          renderInPortal
                          style={{ fontSize: 20 }}
                          dy={-20}
                        />
                      }
                      animate={{
                        duration: 2000,
                        onLoad: { duration: 1000 },
                      }}
                      interpolation="natural"
                      style={{
                        data: {
                          strokeWidth: 3,
                        },
                      }}
                      data={sortOrdersByDateTotal(
                        data?.ownersSingleRestaurant.restaurant.orders
                      )?.map((order) => ({
                        x: order.x,
                        y: order.y,
                      }))}
                    />
                    <VictoryAxis
                      style={{
                        tickLabels: {
                          fontSize: 20,
                          fill: "#2E8A25",
                          fontWeight: 700,
                        },
                      }}
                      tickFormat={(tick) => `$${tick}`}
                      dependentAxis
                    />
                    <VictoryAxis
                      style={{
                        tickLabels: {
                          fontSize: 20,
                          fill: "#1D761D",
                          marginTop: 20,
                          fontWeight: 700,
                        },
                      }}
                      label={"date"}
                      tickFormat={(tick) => new Date(tick).toLocaleDateString()}
                    />
                  </VictoryChart>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SingleRestaurant;
