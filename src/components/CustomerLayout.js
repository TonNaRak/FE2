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
import TopNavBar from "./TopNavBar"; // 1. Import TopNavBar
import useMediaQuery from "../hooks/useMediaQuery"; // 2. Import useMediaQuery
import "./CustomerLayout.css"; // 3. Import ไฟล์ CSS ใหม่
import "../App.css";

const CustomerLayout = () => {
  const location = useLocation();
  // 4. ใช้ useMediaQuery เพื่อตรวจสอบขนาดหน้าจอ
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Logic เดิมของคุณสำหรับซ่อน BottomNavBar ในบางหน้า (จะใช้เฉพาะจอมือถือ)
  const isBottomNavBarVisible =
    !location.pathname.startsWith("/product/") &&
    !location.pathname.startsWith("/checkout") &&
    !location.pathname.startsWith("/payment-confirmation/");

  return (
    <>
      {/* 5. แสดง TopNavBar เมื่อเป็นจอ Desktop */}
      {isDesktop && <TopNavBar />}

      {/* 6. เพิ่ม className เพื่อเว้นที่ให้ Navbar */}
      <div className={isDesktop ? "content-with-top-nav" : "content-with-bottom-nav"}>
        <Outlet />
      </div>

      {/* 7. แสดง BottomNavBar เมื่อเป็นจอมือถือ และอยู่ในหน้าที่กำหนด */}
      {!isDesktop && isBottomNavBarVisible && <BottomNavBar />}
    </>
  );
};

export default CustomerLayout;