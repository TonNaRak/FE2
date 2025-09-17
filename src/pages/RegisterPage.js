import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert, ProgressBar } from "react-bootstrap";
import axios from "axios";
import logoImage from "../images/Logo.jpg";
import { useTranslation } from "react-i18next";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [step, setStep] = useState(1); // State สำหรับควบคุมขั้นตอน
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    // ตรวจสอบข้อมูลใน Step 1 ก่อนไปต่อ
    if (!formData.username || !formData.email || !formData.password) {
      setError("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        }
      );
      setSuccess("ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าล็อกอิน...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "การลงทะเบียนล้มเหลว");
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-left-panel"></div>
      <div className="register-right-panel">
        <div className="register-form-wrapper">
          <div className="text-center mb-4">
            <Link to="/">
              <img
                src={logoImage}
                alt="Company Logo"
                className="register-logo"
              />
            </Link>
          </div>
          <h2 className="text-center register-title">
            {t("create_account_link")}
          </h2>

          {/* Progress Bar */}
          <ProgressBar now={(step / 2) * 100} className="mb-4 " />

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form noValidate onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step active">
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>{t("username_label")}*</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>{t("email_label")}*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>{t("password_label")}*</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      size="lg"
                    />
                    <div
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <BsEyeSlash size={22} />
                      ) : (
                        <BsEye size={22} />
                      )}
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formConfirmPassword">
                  <Form.Label>ยืนยันรหัสผ่าน*</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      size="lg"
                    />
                    <div
                      className="password-toggle-icon"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <BsEyeSlash size={22} />
                      ) : (
                        <BsEye size={22} />
                      )}
                    </div>
                  </div>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" size="lg" onClick={nextStep}>
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step active">
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>{t("phone_label")}</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formAddress">
                  <Form.Label>{t("address_label")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    size="lg"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button variant="secondary" onClick={prevStep}>
                    ย้อนกลับ
                  </Button>
                  <Button variant="primary" type="submit">
                    {t("register_button")}
                  </Button>
                </div>
              </div>
            )}
          </Form>

          <div className="mt-4 text-center">
            <p className="bottom-text">
              {t("already_have_account")}{" "}
              <Link to="/login" className="text-link fw-bold">
                {t("login_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
