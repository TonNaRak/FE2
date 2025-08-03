import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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

  const navItems = [
    { path: "/index", icon: <BsHouseDoorFill />, label: t("nav_home") },
    // { path: "/search", icon: <BsSearch />, label: "ค้นหา" },
    { path: "/cart", icon: <BsCartFill />, label: t("nav_cart") },
    { path: "/location", icon: <BsGeoAltFill />, label: t("nav_location") },
    {
      path: user ? "/profile" : "/login",
      icon: <BsPersonFill />,
      label: t("nav_profile"),
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            "bottom-nav-item" + (isActive ? " active" : "")
          }
        >
          <div className="bottom-nav-icon">{item.icon}</div>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavBar;
