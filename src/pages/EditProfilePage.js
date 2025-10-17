import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import "./EditProfilePage.css";

// กำหนดสีหลักเพื่อให้เข้ากันกับหน้าอื่น
const PRIMARY_COLOR = "#068fc6";

const EditProfilePage = () => {
  const { user, token, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setLoading(false);
    } else {
      // หากไม่มีข้อมูล user ใน context ให้ลอง fetch ใหม่
      refreshUserData().then(() => setLoading(false));
    }
  }, [user, refreshUserData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.put(
        "https://api.souvenir-from-lagoon-thailand.com/api/user/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("บันทึกข้อมูลส่วนตัวสำเร็จ!");
      await refreshUserData(); // ดึงข้อมูลใหม่หลังอัปเดต
    } catch (err) {
      setError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      await axios.put(
        "https://api.souvenir-from-lagoon-thailand.com/api/user/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswordSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
      );
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="edit-profile-page-bg">
      <Container className="edit-profile-container">
        {/* === [แก้ไขใหม่] ส่วนหัวของหน้า: ปุ่มย้อนกลับวงกลม + หัวข้อหลัก (มีพื้นหลังขาว/เงา) === */}
        <div className="edit-profile-header mb-4 p-4 bg-white shadow-sm rounded-3">
          {/* จัดวางปุ่มย้อนกลับและหัวข้อ */}
          <div className="d-flex align-items-center justify-content-center position-relative">
            {/* ปุ่มย้อนกลับ: ไอคอนวงกลมสีฟ้า */}
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="position-absolute start-0 text-decoration-none edit-back-circle"
              style={{ color: PRIMARY_COLOR, zIndex: 10 }}
            >
              {/* Div สำหรับสร้างวงกลมสีฟ้าและทำให้ไอคอนเป็นสีขาว */}
              <div
                className="p-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  width: "40px",
                  height: "40px",
                }}
              >
                {/* ใช้ BsArrowLeft (ลูกศร) เป็นไอคอนสีขาว */}
                <BsArrowLeft
                  className="text-white"
                  style={{ fontSize: "1.2rem" }}
                />
              </div>
            </Button>

            {/* หัวข้อหลัก */}
            <h2
              className="w-100 text-center mb-0"
              style={{ color: PRIMARY_COLOR, fontWeight: 700 }}
            >
              แก้ไขข้อมูลโปรไฟล์
            </h2>
          </div>
        </div>
        {/* ==================================================== */}

        <Row>
          <Col md={6}>
            <Card className="shadow-lg mb-4 edit-profile-card">
              <Card.Header as="h5" className="edit-card-header">
                แก้ไขข้อมูลส่วนตัว
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleProfileSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>ชื่อผู้ใช้</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>อีเมล</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      readOnly // ไม่ควรให้แก้ไขอีเมล
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>เบอร์โทรศัพท์</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>ที่อยู่</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <div className="d-grid mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      className="edit-submit-btn"
                    >
                      บันทึกข้อมูล
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-lg mb-4 edit-profile-card">
              <Card.Header as="h5" className="edit-card-header">
                เปลี่ยนรหัสผ่าน
              </Card.Header>
              <Card.Body>
                {passwordError && (
                  <Alert variant="danger">{passwordError}</Alert>
                )}
                {passwordSuccess && (
                  <Alert variant="success">{passwordSuccess}</Alert>
                )}
                <Form onSubmit={handleChangePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>รหัสผ่านปัจจุบัน</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>รหัสผ่านใหม่</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>ยืนยันรหัสผ่านใหม่</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>
                  <div className="d-grid mt-4">
                    <Button
                      variant="outline-primary"
                      type="submit"
                      className="edit-password-btn"
                    >
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditProfilePage;
