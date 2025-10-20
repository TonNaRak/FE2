import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
    // เพิ่ม State เพื่อจัดการสถานะการย่อ/ขยาย
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // สร้างฟังก์ชันสำหรับสลับสถานะ
    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        // เพิ่ม className แบบไดนามิกตามสถานะ
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <AdminSidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
            />
            <div className="admin-main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;