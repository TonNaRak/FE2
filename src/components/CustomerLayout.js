import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavBar from "./BottomNavBar";
import "../App.css";

const CustomerLayout = () => {
  const location = useLocation();

  const isNavBarVisible = !location.pathname.startsWith("/product/") &&
  !location.pathname.startsWith("/checkout") &&
  !location.pathname.startsWith("/payment-confirmation/");

  return (
    <>
      <div className="app-content">
        <Outlet />
      </div>
      {isNavBarVisible && <BottomNavBar />}
    </>
  );
};

export default CustomerLayout;
