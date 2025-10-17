import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import {
  BsPersonCircle,
  BsReceipt,
  BsQuestionCircle,
  BsBoxArrowRight,
  BsAward,
  BsPencilSquare,
  BsClockHistory,
} from "react-icons/bs";
import { useTranslation } from "react-i18next";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        <p>{t("loading_or_login_prompt")}</p>
        <Button onClick={() => navigate("/login")}>{t("go_to_login")}</Button>
      </Container>
    );
  }

  // สมมติค่าคะแนน
  const userPoints = user.points !== undefined ? user.points : 199324;

  return (
    <div className="profile-page-bg">
      <Container className="profile-container">
        
        {/* ส่วนข้อมูลหลัก (Card) */}
        <Card className="profile-header-card shadow-sm mb-4">
          
          <Card.Body>
            {/* ************************************************** */}
            {/* นำส่วนของ <h5 className="mb-3 text-muted ms-5">{t("profile")}</h5> ออกไปแล้ว */}
            {/* ************************************************** */}
            
            <Row className="align-items-center">
              <Col xs="auto">
                <BsPersonCircle className="profile-avatar" />
              </Col>
              <Col>
                {/* ชื่อผู้ใช้และอีเมล */}
                <h4 className="mb-0">{user.username || "test2"}</h4>
                <p className="text-muted mb-0">{user.email || "test2@gmail.com"}</p>
              </Col>
            </Row>
            {/* ส่วนแสดงคะแนน */}
            <Row className="mt-3">
              <Col xs={12}>
                <div className="points-display">
                  <BsAward className="points-icon" />
                  {userPoints} {t("points")}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {/* สิ้นสุด Card ข้อมูลหลัก */}

        <Card className="profile-menu-card shadow-sm">
          <ListGroup variant="flush">
            <ListGroup.Item
              action
              as={Link}
              to="/profile/edit"
              className="profile-menu-item"
            >
              <BsPencilSquare className="menu-icon" />
              {t("edit_profile")}
            </ListGroup.Item>

            <ListGroup.Item
              action
              as={Link}
              to="/order-history"
              className="profile-menu-item"
            >
              <BsReceipt className="menu-icon" />
              {t("order_history")}
            </ListGroup.Item>

            <ListGroup.Item
              action
              as={Link}
              to="/points-history"
              className="profile-menu-item"
            >
              <BsClockHistory className="menu-icon" />
              {t("points_history")}
            </ListGroup.Item>


            {/* <ListGroup.Item action href="#" className="profile-menu-item">
              <BsQuestionCircle className="menu-icon" />
              {t("help_center")}
            </ListGroup.Item> */}
            <ListGroup.Item
              action
              onClick={handleLogout}
              className="profile-menu-item text-danger"
            >
              <BsBoxArrowRight className="menu-icon" />
              {t("logout")}
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;