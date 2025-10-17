import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Image,
} from "react-bootstrap";
import axios from "axios";
import {
  FaFacebook,
  FaYoutube,
  FaMapMarkedAlt,
  FaMapPin,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./LocationPage.css";
import fixedLogo from "../images/Logo.jpg";

const LocationPage = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchStoreInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/store-info"
        );
        setStoreInfo(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลร้านค้าได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Alert variant="warning">ไม่พบข้อมูลร้านค้า</Alert>
      </div>
    );
  }

  const currentLanguage = i18n.language;
  const storeName =
    currentLanguage === "th"
      ? storeInfo.name
      : storeInfo.name_en || storeInfo.name;
  const storeAddress =
    currentLanguage === "th"
      ? storeInfo.address
      : storeInfo.address_en || storeInfo.address;

  return (
    <div className="location-page-full-width">
      <Card className="store-profile-card-full">
        {/* Cover Photo */}
        <div
          className="store-cover-photo"
          style={{
            backgroundImage: `url(${
              storeInfo.image_url || "/images/placeholder.png"
            })`,
          }}
        ></div>

        <Card.Body className="profile-card-body-full">
          <Container>
            <div className="profile-content-wrapper">
              {/* Logo */}
              <div className="store-logo-wrapper">
                <Image
                  src={fixedLogo}
                  alt="Store Logo"
                  className="store-logo"
                />
              </div>

              <Row>
                <Col md={4} className="d-none d-md-block"></Col>

                <Col md={8} className="info-col">
                  <div className="store-details-content">
                    <h2 className="store-name">{storeName}</h2>

                    <div className="info-item">
                      <FaMapPin className="info-icon" />
                      <span>{storeAddress}</span>
                    </div>
                    <div className="info-item">
                      <FaPhoneAlt className="info-icon" />
                      <span>{storeInfo.phone}</span>
                    </div>
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <span>{storeInfo.email}</span>
                    </div>

                    <hr className="my-3" />

                    {/* ✅ ปุ่ม Facebook / YouTube ซ้าย - ปุ่มนำทาง ขวา */}
                    <div className="actions-container split-row">
                      <div className="left-buttons">
                        {storeInfo.facebook_url && (
                          <Button
                            href={storeInfo.facebook_url}
                            target="_blank"
                            className="social-btn facebook"
                          >
                            <FaFacebook />
                          </Button>
                        )}

                        {storeInfo.youtube_url && (
                          <Button
                            href={storeInfo.youtube_url}
                            target="_blank"
                            className="social-btn youtube"
                          >
                            <FaYoutube />
                          </Button>
                        )}
                      </div>

                      <div className="right-button">
                        <Button
                          variant="primary"
                          href={storeInfo.map_url}
                          target="_blank"
                          className="navigate-btn"
                        >
                          <FaMapMarkedAlt className="me-2" />
                          {t("navigate_button") || "นำทาง"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LocationPage;