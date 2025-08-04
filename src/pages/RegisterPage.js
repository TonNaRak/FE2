
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import logoImage from '../images/Logo.jpg';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // ตรวจสอบว่าใส่รหัสผ่าน
    if (!password) {
        setError('กรุณากรอกรหัสผ่าน');
        return;
    }
    if (password.length < 6) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
    }

    try {
      const response = await axios.post('https://api.souvenir-from-lagoon-thailand.com/api/register', {
        username,
        password,
        email,
        phone,
        address
      });
      
      setSuccess('ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าล็อกอิน...');
      
      // รอ 1 วินาที แล้วค่อยเปลี่ยนหน้าไปหน้าล็อกอิน
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || 'การลงทะเบียนล้มเหลว');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <div className="text-center">
          <img src={logoImage} alt="Company Logo" className="login-logo" />
        </div>
        
        <h2 className="text-center login-title">
          สร้างบัญชีใหม่
        </h2>

        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        {success && <Alert variant="success" className="text-center">{success}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          {/* เพิ่มฟอร์มสำหรับข้อมูลต่างๆ */}
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>ชื่อผู้ใช้*</Form.Label>
            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="minimal-input" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>รหัสผ่าน*</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="minimal-input" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>อีเมล*</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="minimal-input" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label>เบอร์มือถือ</Form.Label>
            <Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="minimal-input" />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formAddress">
            <Form.Label>ที่อยู่</Form.Label>
            <Form.Control as="textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="minimal-input" />
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit" size="lg">
              ลงทะเบียน
            </Button>
          </div>
        </Form>

        <div className="mt-4 text-center">
          <p className="bottom-text">
            มีบัญชีอยู่แล้ว? <Link to="/login" className="text-link fw-bold">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;