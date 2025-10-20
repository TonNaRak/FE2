// import React from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import BottomNavBar from "./BottomNavBar";
// import "../App.css";

// const CustomerLayout = () => {
//   const location = useLocation();

//   const isNavBarVisible = !location.pathname.startsWith("/product/") &&
//   !location.pathname.startsWith("/checkout") &&
//   !location.pathname.startsWith("/payment-confirmation/");

//   return (
//     <>
//       <div className="app-content">
//         <Outlet />
//       </div>
//       {isNavBarVisible && <BottomNavBar />}
//     </>
//   );
// };

// export default CustomerLayout;

// src/components/CustomerLayout.js

// import React from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import BottomNavBar from "./BottomNavBar";
// import "../App.css";

// const CustomerLayout = () => {
//   const location = useLocation();

//   const isNavBarVisible = !location.pathname.startsWith("/product/") &&
//   !location.pathname.startsWith("/checkout") &&
//   !location.pathname.startsWith("/payment-confirmation/");

//   return (
//     <>
//       <div className="app-content">
//         <Outlet />
//       </div>
//       {isNavBarVisible && <BottomNavBar />}
//     </>
//   );
// };

// export default CustomerLayout;

// src/components/CustomerLayout.js

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavBar from "./BottomNavBar";
import TopNavBar from "./TopNavBar"; 
import useMediaQuery from "../hooks/useMediaQuery"; 
import "./CustomerLayout.css"; 
import "../App.css";

const CustomerLayout = () => {
  const location = useLocation();
  // ใช้ useMediaQuery เพื่อตรวจสอบขนาดหน้าจอ
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isBottomNavBarVisible =
    !location.pathname.startsWith("/product/") &&
    !location.pathname.startsWith("/checkout") &&
    !location.pathname.startsWith("/payment-confirmation/");

  return (
    <>
      {/*  แสดง TopNavBar เมื่อเป็นจอ Desktop */}
      {isDesktop && <TopNavBar />}

      <div className={isDesktop ? "content-with-top-nav" : "content-with-bottom-nav"}>
        <Outlet />
      </div>

      {/* แสดง BottomNavBar เมื่อเป็นจอมือถือ และอยู่ในหน้าที่กำหนด */}
      {!isDesktop && isBottomNavBarVisible && <BottomNavBar />}
    </>
  );
};

export default CustomerLayout;