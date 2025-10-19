import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
// import './DashboardPage.css'; // อาจจะใช้ CSS เดียวกัน หรือสร้างใหม่

const ReportsPage = () => {
    return (
        <div className="dashboard-container"> {/* ใช้คลาสเดิมได้ ถ้าสไตล์เหมือนกัน */}
            <h1>รายงาน (Reports)</h1>
            
            {/* เมนูย่อยสำหรับเลือกหน้า */}
            <Nav variant="tabs" defaultActiveKey="/admin/reports" className="mb-4">
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/reports" end>
                        รายวัน
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/reports/monthly">
                        รายเดือน
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to="/admin/reports/yearly">
                        รายปี
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

export default ReportsPage;