import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css'; // <-- 1. เพิ่มการ import ไฟล์ CSS ใหม่

const AdminLayout = () => {
    // 2. เพิ่ม State เพื่อจัดการสถานะการย่อ/ขยาย
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // 3. สร้างฟังก์ชันสำหรับสลับสถานะ
    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        // 4. เพิ่ม className แบบไดนามิกตามสถานะ
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