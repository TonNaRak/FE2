// src/components/TopNavBar.js

import React, { useState, useMemo, useRef, useEffect } from "react"; // 1. เพิ่ม useEffect
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Form,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // 2. Import axios
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  BsPersonCircle,
  BsBoxArrowRight,
  BsCart,
  BsSearch,
  BsGeoAlt,
  BsGlobe,
  BsCheck,
} from "react-icons/bs";
import logoImage from "../images/Logo.jpg";
import "./TopNavBar.css";
import "../theme-overrides.css";


const TopNavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t, i18n } = useTranslation(); // 3. เรียกใช้ t function

  // 4. เพิ่ม State สำหรับเก็บข้อมูลร้านค้า
  const [storeInfo, setStoreInfo] = useState({ name: "Loading..." });

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const langTimerRef = useRef(null);
  const userTimerRef = useRef(null);

  const canHover = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(hover: hover)").matches;
  }, []);

  // 5. ดึงข้อมูลร้านค้าเมื่อ Component โหลด
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/store-info"
        );
        if (response.data) {
          setStoreInfo(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch store info:", error);
        setStoreInfo({ name: "ชื่อร้านค้า" }); // Fallback name
      }
    };
    fetchStoreInfo();
  }, []);

  const languages = [
    { code: "th", name: "ไทย" },
    { code: "en", name: "English" },
  ];
  const currentLanguage = languages.find((lang) =>
    i18n.language.startsWith(lang.code)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const userOver = () => {
    if (!canHover) return;
    clearTimer(userTimerRef);
    userTimerRef.current = setTimeout(() => setIsUserOpen(true), 60);
  };
  const userOut = () => {
    if (!canHover) return;
    clearTimer(userTimerRef);
    userTimerRef.current = setTimeout(() => setIsUserOpen(false), 100);
  };

  const langOver = () => {
    if (!canHover) return;
    clearTimer(langTimerRef);
    langTimerRef.current = setTimeout(() => setIsLangOpen(true), 60);
  };
  const langOut = () => {
    if (!canHover) return;
    clearTimer(langTimerRef);
    langTimerRef.current = setTimeout(() => setIsLangOpen(false), 100);
  };

  return (
    <Navbar  className="shadow-sm top-navbar" fixed="top">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/index"
          className="d-flex align-items-center"
        >
          <img
            src={logoImage}
            width="45"
            height="45"
            className="d-inline-block align-top rounded-circle me-2"
            alt="Logo"
          />
          {i18n.language.startsWith("en") && storeInfo.name_en
            ? storeInfo.name_en
            : storeInfo.name}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Form
              onSubmit={handleSearchSubmit}
              className="d-flex top-nav-search me-2"
            >
              <Form.Control
                type="search"
                placeholder={t("search_placeholder_nav")}
                className="search-input-static"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                variant="link"
                className="search-submit-btn"
              >
                <BsSearch />
              </Button>
            </Form>

            <Nav.Link
              as={Link}
              to="/cart"
              className="nav-icon-link"
              title={t("nav_cart")}
            >
              <BsCart size={22} />
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/location"
              className="nav-icon-link"
              title={t("nav_location")}
            >
              <BsGeoAlt size={22} />
            </Nav.Link>

            <NavDropdown
              title={<BsGlobe size={22} />}
              id="language-nav-dropdown"
              className="nav-icon-dropdown"
              align="end"
              show={canHover ? isLangOpen : undefined}
              onMouseOver={langOver}
              onMouseOut={langOut}
              onToggle={(nextShow, e) => {
                if (!canHover) return;
                if (e && e.type === "click") {
                  clearTimer(langTimerRef);
                  setIsLangOpen(nextShow);
                }
              }}
            >
              {languages.map((lang) => {
                const isActive = currentLanguage?.code === lang.code;
                return (
                  <NavDropdown.Item
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    active={isActive}
                    className={`lang-item ${isActive ? "is-active" : ""}`}
                  >
                    <span className="check" aria-hidden="true">
                      {isActive ? <BsCheck /> : null}
                    </span>
                    <span className="lang-name">{lang.name}</span>
                  </NavDropdown.Item>
                );
              })}
            </NavDropdown>

            {user ? (
              <NavDropdown
                title={<BsPersonCircle size={24} />}
                id="user-nav-dropdown"
                align="end"
                className="nav-icon-dropdown"
                show={canHover ? isUserOpen : undefined}
                onMouseOver={userOver}
                onMouseOut={userOut}
                onToggle={(nextShow, e) => {
                  if (!canHover) return;
                  if (e && e.type === "click") {
                    clearTimer(userTimerRef);
                    setIsUserOpen(nextShow);
                  }
                }}
              >
                <NavDropdown.Header>
                  {t("nav_hello")}, {user.username}
                </NavDropdown.Header>
                <NavDropdown.Item as={Link} to="/profile">
                  {t("nav_profile")}
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/order-history">
                  {t("nav_order_history")}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={handleLogout}
                  className="text-danger"
                >
                  <BsBoxArrowRight className="me-2" />
                  {t("nav_logout")}
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown
                title={<BsPersonCircle size={24} />}
                id="guest-nav-dropdown"
                align="end"
                className="nav-icon-dropdown"
                show={canHover ? isUserOpen : undefined}
                onMouseOver={userOver}
                onMouseOut={userOut}
                onToggle={(nextShow, e) => {
                  if (!canHover) return;
                  if (e && e.type === "click") {
                    clearTimer(userTimerRef);
                    setIsUserOpen(nextShow);
                  }
                }}
              >
                <NavDropdown.Item as={Link} to="/login">
                  {t("nav_login")}
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/register">
                  {t("nav_register")}
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavBar;
