import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaSignOutAlt,
  FaCog,
  FaClipboardList,
  FaUsersCog,
  FaTags,
  FaCashRegister,
  FaBars,
  FaUserCircle, // เพิ่มไอคอน User
} from "react-icons/fa";
import "./AdminSidebar.css";

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">Admin</h3>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaTachometerAlt /> <span>แดชบอร์ด</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/pos"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCashRegister /> <span>ขายหน้าร้าน (POS)</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBoxOpen /> <span>จัดการสินค้า</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaClipboardList /> <span>จัดการคำสั่งซื้อ</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/store-settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCog /> <span>ตั้งค่าร้านค้า</span>
          </NavLink>
        </li>
        {user && user.role === "admin" && (
          <>
            <li>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaTags /> <span>จัดการประเภท</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/roles"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaUsersCog /> <span>จัดการสิทธิ์</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user-info">
            <FaUserCircle className="user-avatar" />
            <div className="user-details">
              <span className="sidebar-user-name">{user.username}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
