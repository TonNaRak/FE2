import React from 'react';
import { Container } from 'react-bootstrap';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center text-center dashboard-coming-soon"
    >
      <div>
        <h1 className="coming-soon-title">Coming Soon</h1>
        <p className="coming-soon-subtitle">
          หน้าแดชบอร์ดกำลังอยู่ในระหว่างการพัฒนา และจะพร้อมใช้งานในเร็วๆ นี้
        </p>
      </div>
    </Container>
  );
};

export default DashboardPage;