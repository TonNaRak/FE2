// src/pages/admin/ReportsPage.js
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Nav, Card, Row, Col } from "react-bootstrap";

const ReportsPage = () => {
  // 1. สร้าง String CSS
  // นี่คือ CSS ที่จะไปบังคับเปลี่ยนสีปุ่ม 'active' ให้เป็นสีเขียว
  const customNavStyle = `
    .report-nav-pills .nav-link.active,
    .report-nav-pills .show > .nav-link {
      background-color: #31bd9c;
      color: #fff;
    }

    /* ทำให้ปุ่มที่ไม่ active เป็นสีเทา จะได้ไม่เป็นสีฟ้า (สีลิงก์) */
    .report-nav-pills .nav-link:not(.active) {
      color: #6c757d; /* สีเทา (secondary) ของ Bootstrap */
    }

    /* (Optional) ทำให้ปุ่มที่ไม่ active เมื่อ hover เป็นสีเขียวอ่อน */
    .report-nav-pills .nav-link:hover:not(.active) {
      color: #2a9d82; /* สีเขียวเข้มขึ้นเล็กน้อย */
    }
  `;

  return (
    <div className="d-flex flex-column gap-3">
      {/* 2. ฝัง CSS ที่เราสร้างไว้ในหน้า */}
      <style>{customNavStyle}</style>

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
              <h2 className="mb-0 fw-bold" style={{ color: "#31bd9c" }}>
                Report
              </h2>

              {/* 3. เพิ่ม className "report-nav-pills"
                  เพื่อให้ CSS ด้านบนทำงานเฉพาะกับ Nav นี้
              */}
              <Nav
                variant="pills"
                defaultActiveKey="/admin/reports"
                className="report-nav-pills"
              >
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Outlet />
    </div>
  );
};

export default ReportsPage;
