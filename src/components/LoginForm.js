import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import logoImage from "../images/Logo.jpg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://api.souvenir-from-lagoon-thailand.com/api/login", {
        identifier: username,
        password: password,
      });

      const loggedInUser = response.data.user;
      
      // --- START: จุดที่แก้ไข ---
      const { accessToken, refreshToken } = response.data;
      login(loggedInUser, accessToken, refreshToken);
      // --- END: จุดที่แก้ไข ---

      if (loggedInUser.role === "admin" || loggedInUser.role === "employee") {
        navigate("/admin/dashboard");
      } else {
        navigate("/index");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <div className="text-center">
          <img src={logoImage} alt="Company Logo" className="login-logo" />
        </div>

        <h2 className="text-center login-title">เข้าสู่ระบบ</h2>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="minimal-input-group " controlId="formUsername">
            <Form.Label>ชื่อผู้ใช้</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="minimal-input"
            />
          </Form.Group>

          <Form.Group className="minimal-input-group" controlId="formPassword">
            <Form.Label>รหัสผ่าน</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="minimal-input"
            />
          </Form.Group>

          <div className="text-end mb-4">
            <a href="#forgot" className="text-link">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <div className="d-grid">
            <Button variant="primary" type="submit" size="lg">
              เข้าสู่ระบบ
            </Button>
          </div>
        </Form>
        <div className="divider-container my-4">
          <hr className="divider-line" />
          <span className="divider-text">หรือ</span>
          <hr className="divider-line" />
        </div>
        <div className="mt-5 text-center">
          <p className="bottom-text">
            ยังไม่มีบัญชีใช่ไหม?{" "}
            <Link to="/register" className="text-link fw-bold">
              สร้างบัญชี
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;