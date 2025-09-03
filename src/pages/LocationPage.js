import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { FaFacebook, FaYoutube, FaMapMarkedAlt } from "react-icons/fa";
import "./LocationPage.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocationPage = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/store-info"
        );
        setStoreInfo(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลร้านค้าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, []);

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  if (error)
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  if (!storeInfo) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="info">
          <Alert.Heading>ยังไม่มีข้อมูลร้านค้า</Alert.Heading>
          <p>
            เจ้าของร้านยังไม่ได้ตั้งค่าข้อมูลร้านค้า
            กรุณาตรวจสอบอีกครั้งในภายหลัง
          </p>
          <hr />
          <Link to="/index">
            <Button variant="outline-primary">กลับไปหน้าแรก</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="location-page-bg">
      <Container className="location-container my-5">
        <Card className="shadow-sm">
          <Card.Body>
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                <img
                  src={storeInfo.image_url}
                  alt={t("storefront_alt")}
                  className="store-image img-fluid rounded mb-4"
                />
              </Col>
              <Col md={6} className="d-flex flex-column justify-content-center">
                <h2 className="store-name">
                  {i18n.language === "en" && storeInfo.name_en
                    ? storeInfo.name_en
                    : storeInfo.name}
                </h2>
                <p>
                  <strong>{t("address_label")}:</strong>{" "}
                  {i18n.language === "en" && storeInfo.address_en
                    ? storeInfo.address_en
                    : storeInfo.address}
                </p>
                <p>
                  <strong>{t("phone_label")}:</strong> {storeInfo.phone}
                </p>
                <p>
                  <strong>{t("email_label")}:</strong> {storeInfo.email}
                </p>

                <div className="mt-3">
                  {storeInfo.facebook_url && (
                    <Button
                      href={storeInfo.facebook_url}
                      target="_blank"
                      variant="outline-primary"
                      className="me-2 social-btn"
                    >
                      <FaFacebook /> Facebook
                    </Button>
                  )}
                  {storeInfo.youtube_url && (
                    <Button
                      href={storeInfo.youtube_url}
                      target="_blank"
                      variant="outline-danger"
                      className="social-btn"
                    >
                      <FaYoutube /> YouTube
                    </Button>
                  )}
                </div>

                <div className="d-grid mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    href={storeInfo.map_url}
                    target="_blank"
                  >
                    <FaMapMarkedAlt className="me-2" />
                    {t("navigate_button")}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LocationPage;
