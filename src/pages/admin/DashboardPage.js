// src/pages/admin/DashboardPage.js
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
// Import เพิ่ม Card, Row, Col
import { Nav, Card, Row, Col } from "react-bootstrap";
// ลบ CSS import เก่า
// import './DashboardPage.css';

const DashboardPage = () => {
  // 1. คัดลอก CSS มาจาก ReportsPage
  // 2. เปลี่ยนชื่อ class เป็น .dashboard-nav-pills
  const customNavStyle = `
    .dashboard-nav-pills .nav-link.active,
    .dashboard-nav-pills .show > .nav-link {
      background-color: #31bd9c;
      color: #fff;
    }

    .dashboard-nav-pills .nav-link:not(.active) {
      color: #6c757d; /* สีเทา (secondary) */
    }

    .dashboard-nav-pills .nav-link:hover:not(.active) {
      color: #2a9d82; /* สีเขียวเข้มขึ้นเล็กน้อย */
    }
  `;

  return (
    // 3. เปลี่ยน layout หลัก
    <div className="d-flex flex-column gap-3">
      {/* 4. ฝัง CSS ที่เราสร้างไว้ */}
      <style>{customNavStyle}</style>

      {/* 5. สร้าง Header Card ใหม่ */}
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
              {/* หัวข้อด้านซ้าย */}
              <h5
                className="mb-0 fw-bold"
                style={{ color: "#31bd9c" }}
              >
                Dashboard
              </h5>

              {/* 6. ย้าย Nav มาใส่ด้านขวา และเปลี่ยนเป็น pills */}
              <Nav
                variant="pills"
                defaultActiveKey="/admin/dashboard"
                className="dashboard-nav-pills" // ใช้ class ใหม่
              >
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 7. ลบ div เก่าที่ครอบ Outlet ออก */}
      <Outlet />
    </div>
  );
};

export default DashboardPage;