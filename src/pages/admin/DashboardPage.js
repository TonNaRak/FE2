import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import './DashboardPage.css'; // เราจะสร้างไฟล์ CSS นี้ในขั้นตอนต่อไป

const DashboardPage = () => {
    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            
            {/* เมนูย่อยสำหรับเลือกหน้า */}
            <Nav variant="tabs" defaultActiveKey="/admin/dashboard" className="mb-4">
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/dashboard" end>
                        ภาพรวม
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/dashboard/products">
                        สินค้า & หมวดหมู่
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/dashboard/customers">
                        ลูกค้า
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* พื้นที่สำหรับแสดงเนื้อหาของหน้าย่อย (สำคัญมาก!) */}
            <div className="dashboard-content">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardPage;