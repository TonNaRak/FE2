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
    <div className="landing-page-container position-relative">
      <Link to="/index" className="skip-button">
        {t("skip_button")}
      </Link>

      <div className="landing-language-switcher-top">
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
            className="landing-button"
          >
            {t("register_button")}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
