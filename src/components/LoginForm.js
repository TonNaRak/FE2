import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import logoImage from "../images/Logo.jpg";
import { useTranslation } from "react-i18next";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import "./LoginForm.css"; // 1. import ไฟล์ CSS ใหม่

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/login",
        {
          identifier: username,
          password: password,
        }
      );

      const loggedInUser = response.data.user;
      const { accessToken, refreshToken } = response.data;
      login(loggedInUser, accessToken, refreshToken);

      if (loggedInUser.role === "admin" || loggedInUser.role === "employee") {
        navigate("/admin/dashboard");
      } else {
        navigate("/index");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    // 2. ปรับโครงสร้าง JSX ทั้งหมด
    <div className="login-page-container">
      <div className="login-left-panel"></div>
      <div className="login-right-panel">
        <div className="login-form-wrapper">
          <div className="text-center mb-4">
            <Link to="/">
              <img src={logoImage} alt="Company Logo" className="login-logo" />
            </Link>
          </div>

          <h2 className="text-center login-title">{t("login_title")}</h2>

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>{t("username_label")}</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formPassword">
              <Form.Label>{t("password_label")}</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                />
                <div
                  className="password-toggle-icon"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <BsEyeSlash size={22} />
                  ) : (
                    <BsEye size={22} />
                  )}
                </div>
              </div>
            </Form.Group>

            {/* <div className="text-end mb-4">
              <a href="#forgot" className="text-link">
                {t("forgot_password")}
              </a>
            </div> */}

            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg">
                {t("login_button")}
              </Button>
            </div>
          </Form>

          <div className="divider-container my-4">
            <hr className="divider-line" />
            <span className="divider-text">{t("or_divider")}</span>
            <hr className="divider-line" />
          </div>

          <div className="mt-4 text-center">
            <p className="bottom-text">
              {t("no_account_prompt")}{" "}
              <Link to="/register" className="text-link fw-bold">
                {t("create_account_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
