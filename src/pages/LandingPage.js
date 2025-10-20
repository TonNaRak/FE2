import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import logoImage from "../images/Logo.jpg";
import "./LandingPage.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-page-container">
      <div className="left-panel"></div>

      <div className="right-panel">
        {/* --- [จุดลบ] ลบปุ่มเปลี่ยนภาษาจากตรงนี้ (ถ้ายังมีอยู่) --- */}

        <div className="right-panel-content">
          {/* --- [จุดย้าย] ย้ายปุ่มเปลี่ยนภาษามาไว้ตรงนี้ --- */}
          <div className="landing-language-switcher">
            <LanguageSwitcher />
          </div>

          <Container className="text-center">
            <img src={logoImage} alt="Company Logo" className="landing-logo" />

            <h1 className="landing-title">{t("welcome_title")}</h1>

            <p className="landing-subtitle">{t("welcome_subtitle")} </p>

            <div
              className="d-grid gap-3 mt-5 mx-auto"
              style={{ maxWidth: "320px" }}
            >
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="lg"
                className="landing-button"
              >
                {t("login_button")}
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline-primary"
                size="lg"
                className="landing-button-outline"
              >
                {t("register_button")}
              </Button>
            </div>

            <div className="mt-4">
              <Link to="/index" className="skip-button">
                {t("skip_button")}
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;