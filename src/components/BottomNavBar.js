// import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import {
//   BsHouseDoorFill,
//   BsCartFill,
//   BsGeoAltFill,
//   BsPersonFill,
// } from "react-icons/bs";
// import "./BottomNavBar.css";
// import { useAuth } from "../context/AuthContext";

// const BottomNavBar = () => {
//   const { user } = useAuth();
//   const { t } = useTranslation();

//   const navItems = [
//     { path: "/index", icon: <BsHouseDoorFill />, label: t("nav_home") },
//     // { path: "/search", icon: <BsSearch />, label: "ค้นหา" },
//     { path: "/cart", icon: <BsCartFill />, label: t("nav_cart") },
//     { path: "/location", icon: <BsGeoAltFill />, label: t("nav_location") },
//     {
//       path: user ? "/profile" : "/login",
//       icon: <BsPersonFill />,
//       label: t("nav_profile"),
//     },
//   ];

//   return (
//     <nav className="bottom-nav">
//       {navItems.map((item) => (
//         <NavLink
//           key={item.path}
//           to={item.path}
//           className={({ isActive }) =>
//             "bottom-nav-item" + (isActive ? " active" : "")
//           }
//         >
//           <div className="bottom-nav-icon">{item.icon}</div>
//           <span className="bottom-nav-label">{item.label}</span>
//         </NavLink>
//       ))}
//     </nav>
//   );
// };

// export default BottomNavBar;

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BsHouseDoor,
  BsCart,
  BsGeoAlt,
  BsPerson,
  BsHouseDoorFill,
  BsCartFill,
  BsGeoAltFill,
  BsPersonFill,
} from "react-icons/bs";
import "./BottomNavBar.css";
import { useAuth } from "../context/AuthContext";

const BottomNavBar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  const navItems = [
    {
      path: "/index",
      icon: BsHouseDoor,
      activeIcon: BsHouseDoorFill,
      //label: t("nav_home"),
    },
    {
      path: "/cart",
      icon: BsCart,
      activeIcon: BsCartFill,
      //label: t("nav_cart"),
    },
    {
      path: "/location",
      icon: BsGeoAlt,
      activeIcon: BsGeoAltFill,
      //label: t("nav_location"),
    },
    {
      path: user ? "/profile" : "/login",
      icon: BsPerson,
      activeIcon: BsPersonFill,
      //label: t("nav_profile"),
    },
  ];

  useEffect(() => {
    const activeItem = navRef.current.querySelector(".bottom-nav-item.active");
    if (activeItem) {
      setIndicatorStyle({
        width: `${activeItem.offsetWidth}px`,
        left: `${activeItem.offsetLeft}px`,
      });
    }
  }, [location.pathname, navItems.length]); // Recalculate on path or user change

  return (
    <nav className="bottom-nav" ref={navRef}>
      <div className="nav-indicator" style={indicatorStyle}></div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const ActiveIcon = item.activeIcon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              "bottom-nav-item" + (isActive ? " active" : "")
            }
          >
            <div className="bottom-nav-icon">
              {location.pathname === item.path ? <ActiveIcon /> : <Icon />}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
