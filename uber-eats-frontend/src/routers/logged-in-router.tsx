import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// import { isLoggedInVar } from '../apollo'
import Restaurants from "../pages/client/Restaurants";
import Page404 from "../pages/404";
import Header from "../components/Header";
import useCurrentUser from "../hooks/useCurrentUser";
import ConfirmEmail from "../pages/user/ConfirmEmail";
import SpinnerBasic from "../components/reusable/SpinnerBasic";
import EditProfile from "../pages/user/EditProfile";
import SearchPage from "../pages/client/SearchPage";
import Category from "../pages/client/Category";
import Restaurant from "../pages/client/Restaurant";
import MyRestaurants from "../pages/owner/MyRestaurants";
import AddRestaurant from "../pages/owner/AddRestaurant";
import { ScrollToTopControlller } from "../hooks/scrollTopHook";
import SingleRestaurant from "../pages/owner/SingleRestaurant";
import CreateDish from "../pages/owner/CreateDish";
import Order from "../pages/Order";
import DashBoard from "../pages/driver/DashBoard";
import { UserRole } from "../__api_schema_typed__/globalTypes";

export const LoggedInRouter = () => {
  // const logOut = () => {
  //   isLoggedInVar(false)
  // }

  const clientRoutes = [
    { path: "/", page: Restaurants, exact: true },
    { path: "/category/:slug", page: Category, exact: false },
    { path: "/restaurant/:id", page: Restaurant, exact: false },
    { path: "/search", page: SearchPage, exact: false },
  ];

  const ownerRoutes = [
    { path: "/", page: MyRestaurants, exact: true },
    { path: "/add-restaurant", page: AddRestaurant, exact: false },
    {
      path: "/restaurant/:restaurantId/addMenuItem",
      page: CreateDish,
      exact: true,
    },
    { path: "/restaurant/:id", page: SingleRestaurant, exact: false },
  ];

  const driverRoutes = [{ path: "/", page: DashBoard, exact: true }];

  const commonRoutes = [
    { path: "/edit-profile", page: EditProfile, exact: false },
    { path: "/confirm", page: ConfirmEmail, exact: false },
    { path: "/orders/:orderId", page: Order, exact: false },
    { path: "*", page: Page404, exact: false },
  ];
  const { data, loading, error } = useCurrentUser();
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <h2 className="mb-10 text-2xl font-medium tracking-wider">
            Wait. Just Watch
          </h2>
          <SpinnerBasic />
        </div>
      </div>
    );
  }
  return (
    <Router>
      <Header />
      <ScrollToTopControlller />
      <Switch>
        {data.me.role === UserRole.Client &&
          [...clientRoutes, ...commonRoutes].map((route) => (
            <Route
              key={route.path}
              path={route.path}
              component={route.page}
              exact={route.exact}
            />
          ))}
        {data.me.role === UserRole.Owner &&
          [...ownerRoutes, ...commonRoutes].map((route) => (
            <Route
              key={route.path}
              path={route.path}
              component={route.page}
              exact={route.exact}
            />
          ))}
        {data.me.role === UserRole.Delivery &&
          [...driverRoutes, ...commonRoutes].map((route) => (
            <Route
              key={route.path}
              path={route.path}
              component={route.page}
              exact={route.exact}
            />
          ))}
      </Switch>
    </Router>
  );
};
