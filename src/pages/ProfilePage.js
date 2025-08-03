import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // 1. Import Link
import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import {
  BsPersonCircle,
  BsPersonVcard,
  BsReceipt,
  BsQuestionCircle,
  BsBoxArrowRight,
  BsAward,
} from "react-icons/bs";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (refreshUserData) {
      refreshUserData();
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <Container className="profile-container text-center mt-5">
        <p>กำลังโหลดข้อมูล หรือ กรุณาเข้าสู่ระบบ</p>
        <Button onClick={() => navigate("/login")}>ไปที่หน้าเข้าสู่ระบบ</Button>
      </Container>
    );
  }

  return (
    <div className="profile-page-bg">
      <Container className="profile-container">
        <Card className="profile-header-card shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col xs="auto">
                <BsPersonCircle className="profile-avatar" />
              </Col>
              <Col>
                <h4 className="mb-0">{user.username}</h4>
                <p className="text-muted mb-0">{user.email}</p>
              </Col>
              <Col xs="auto" className="text-end">
                <div className="points-display">
                  <BsAward className="points-icon" />
                  <span>{user.points || 0} แต้ม</span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="profile-menu-card shadow-sm">
          <ListGroup variant="flush">
            <ListGroup.Item action href="#" className="profile-menu-item">
              <BsPersonVcard className="menu-icon" />
              ข้อมูลผู้ใช้
            </ListGroup.Item>

            <ListGroup.Item
              action
              as={Link}
              to="/order-history"
              className="profile-menu-item"
            >
              <BsReceipt className="menu-icon" />
              ประวัติคำสั่งซื้อ
            </ListGroup.Item>

            <ListGroup.Item action href="#" className="profile-menu-item">
              <BsQuestionCircle className="menu-icon" />
              ศูนย์ความช่วยเหลือ
            </ListGroup.Item>
            <ListGroup.Item
              action
              onClick={handleLogout}
              className="profile-menu-item text-danger"
            >
              <BsBoxArrowRight className="menu-icon" />
              ออกจากระบบ
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;
