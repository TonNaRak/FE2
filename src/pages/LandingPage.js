// src/pages/LandingPage.js
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logoImage from '../images/Logo.jpg'; // ตรวจสอบว่า path ถูกต้อง
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page-container position-relative"> 

      {/* ปุ่ม "ข้าม" ที่มุมขวาบน */}
      <Link to="/index" className="skip-button">
        ข้าม →
      </Link>

      <Container className="text-center">
        <img src={logoImage} alt="Company Logo" className="landing-logo" />
        
        <h1 className="landing-title">
          ยินดีต้อนรับ
        </h1>

        <p className="landing-subtitle">
          เริ่มต้นใช้งานโดยการเข้าสู่ระบบ หรือสร้างบัญชีใหม่
        </p>

        <div className="d-grid gap-3 mt-5 mx-auto" style={{ maxWidth: '320px' }}>
          <Button as={Link} to="/login" variant="primary" size="lg" className="landing-button">
            เข้าสู่ระบบ
          </Button>
          <Button as={Link} to="/register" variant="outline-primary" size="lg" className="landing-button">
            สร้างบัญชีใหม่
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;