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
  FaChevronLeft, // <-- 1. เพิ่มไอคอนลูกศร
  FaBars,
} from "react-icons/fa";
import "./AdminSidebar.css";

// 2. รับ props isCollapsed และ toggleSidebar
const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    // 3. เพิ่ม className แบบไดนามิกตามสถานะ
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
          {/* --- START: จุดที่แก้ไข --- */}
        {/* 2. เปลี่ยน H3 เป็น h3 ที่มี className และย้ายปุ่มมาอยู่ข้างๆ */}
        <h3 className="sidebar-title">Admin</h3>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        {/* --- END: จุดที่แก้ไข --- */}
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
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
