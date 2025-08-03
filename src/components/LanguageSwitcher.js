// src/components/LanguageSwitcher.js
import React from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup } from "react-bootstrap";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    // ButtonGroup ทำให้ปุ่มอยู่ติดกันสวยงาม
    <ButtonGroup size="sm">
      <Button
        variant={i18n.language === "th" ? "primary" : "outline-primary"}
        onClick={() => i18n.changeLanguage("th")}
      >
        ไทย
      </Button>
      <Button
        variant={i18n.language === "en" ? "primary" : "outline-primary"}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;
