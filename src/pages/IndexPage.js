import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BsSearch, BsStarFill } from "react-icons/bs";
import useMediaQuery from "../hooks/useMediaQuery";
import { useTranslation } from "react-i18next";
import "./IndexPage.css";

import myLogo1 from "../images/icon1.png";
import myLogo2 from "../images/icon2.png";
import recommendedIcon from "../images/recommended.png";
import headPic1 from "../images/37ccc7c6-4ddf-4dad-9866-0dcb05ab28af.jpeg"
import headPic2 from "../images/1755586122179-S__5496840.jpg"
import headPic3 from "../images/Screenshot 2568-10-20 at 00.26.34.png"

import LanguageSwitcher from "../components/LanguageSwitcher";


const HeroSection = ({ onShopNowClick, scrollY }) => {
  const { t } = useTranslation();

  const parallaxStyle = {
    transform: `translateY(${scrollY * 0.2}px)`,
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="reviews">
          <img src={myLogo1} alt="Logo 1" />
          <img src={myLogo2} alt="Logo 2" />
          <span>{t("hero_community_tag")}</span>
        </div>
        <h1>{t("hero_title")}</h1>
        <p>{t("hero_subtitle")}</p>
        <button className="cta-button" onClick={onShopNowClick}>
          {t("hero_cta_button")}
        </button>
      </div>
      <div className="hero-images" style={parallaxStyle}>
        <img
          src={headPic1}
          alt="Main skincare model"
          className="image-main"
        />
        <img
          src={headPic3}
          alt="Hand with cream"
          className="image-side1"
        />
        <img
          src={headPic2}
          alt="Skincare products"
          className="image-side2"
        />
      </div>
    </div>
  );
};

const IndexPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // คงไว้ แต่ไม่ใช้โชว์ทั้งกริด เพื่อลด layout shift
  const [activeFilter, setActiveFilter] = useState({ type: "all" });
  const [cartMessage, setCartMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const productsSectionRef = useRef(null);

  // === ป้องกันกระตุกด้วย overlay + คงความสูงกริดชั่วคราว ===
  const productsWrapRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  const [gridMinHeight, setGridMinHeight] = useState(0);

  // === ใหม่: ใช้เลื่อนจอให้แถบประเภทชิดบน ===
  const filterScrollRef = useRef(null);
  const filterBarRef = useRef(null);

  const [thumbStyle, setThumbStyle] = useState({ width: "0%", left: "0%" });

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScrollWindow = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScrollWindow);
    return () => window.removeEventListener("scroll", handleScrollWindow);
  }, []);

  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleScrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/public/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      // ก่อนโหลด: ล็อกความสูงกริดปัจจุบัน + เปิด overlay
      setGridMinHeight(productsWrapRef.current?.offsetHeight || 0);
      setIsFetching(true);
      setLoading(true);

      let url = "https://api.souvenir-from-lagoon-thailand.com/api/products";
      const params = {};

      if (isSearched && submittedSearchTerm.trim() !== "") {
        url =
          "https://api.souvenir-from-lagoon-thailand.com/api/products/search";
        params.q = submittedSearchTerm;
      } else {
        if (activeFilter.type === "category") {
          params.category = activeFilter.id;
        } else if (activeFilter.type === "recommended") {
          params.recommended = true;
        }
      }

      try {
        const response = await axios.get(url, { params });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setIsFetching(false);
        // หน่วงสั้น ๆ ให้ layout ใหม่ takeover แล้วค่อยปล่อย min-height
        setTimeout(() => setGridMinHeight(0), 50);
      }
    };
    fetchProducts();
  }, [activeFilter, isSearched, submittedSearchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilter({ type: "all" });
    setSubmittedSearchTerm(searchTerm);
    setIsSearched(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSubmittedSearchTerm("");
    setIsSearched(false);
  };

  // ===== Scroll Indicator Logic =====
  const updateThumb = () => {
    const el = filterScrollRef.current;
    if (!el) return;

    const total = el.scrollWidth;
    const view = el.clientWidth;
    const maxScroll = Math.max(total - view, 1);
    const visibleFrac = Math.min(view / total, 1);
    const thumbWidthPct = Math.max(visibleFrac * 100, 10);
    const leftFrac = el.scrollLeft / maxScroll;
    const leftPct = leftFrac * (100 - thumbWidthPct);

    setThumbStyle({
      width: `${thumbWidthPct}%`,
      left: `${leftPct}%`,
    });
  };

  useEffect(() => {
    updateThumb();
    const el = filterScrollRef.current;
    if (!el) return;
    const onScroll = () => updateThumb();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateThumb);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateThumb);
    };
  }, [categories]);

  // ===== ใหม่: เลื่อนให้แถบประเภทชิดบนเมื่อเลือกกรอง =====
  const scrollToFilterTop = () => {
    if (!filterBarRef.current) return;
    const rect = filterBarRef.current.getBoundingClientRect();
    const docTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    // เผื่อระยะบนสำหรับ Desktop ที่มี Top Navbar
    const offset = window.innerWidth >= 992 ? 72 : 8;

    const targetTop = rect.top + docTop - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  const handleSelectFilter = (next) => {
    setActiveFilter(next);
    // กำหนดเลื่อนหลัง setState เพื่อให้ตำแหน่ง DOM คงที่
    // ใช้ rAF เพื่อให้แน่ใจว่าเบราว์เซอร์คำนวน layout รอบถัดไปแล้ว
    requestAnimationFrame(() => {
      scrollToFilterTop();
    });
  };

  return (
    <div className="index-page">
      <HeroSection onShopNowClick={handleScrollToProducts} scrollY={scrollY} />
      <Container className="py-4 products-section-container" ref={productsSectionRef}>
        <div className="d-flex justify-content-end mb-3 d-md-none">
          <LanguageSwitcher />
        </div>

        {cartMessage && (
          <Alert variant="success" className="mb-4">
            {cartMessage}
          </Alert>
        )}

        <div className="page-header text-center mb-4">
          <h2>{t("discover_products")}</h2>
          <p className="text-muted">{t("sub_discover_products")}</p>
        </div>

        <div className="search-bar-wrapper mb-4">
          {isMobile ? (
            <div
              className="search-bar-mobile"
              onClick={() => navigate("/search")}
            >
              <BsSearch />
              <span>{t("search_products")}</span>
            </div>
          ) : (
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  placeholder={t("search_products")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  {t("search")}
                </Button>
              </InputGroup>
            </Form>
          )}
        </div>

        {isSearched && (
          <div className="text-center mb-4">
            {t("Search_results_for")} "{submittedSearchTerm}"
            <Button variant="link" onClick={clearSearch}>
              {t("clear")}
            </Button>
          </div>
        )}

        {!isSearched && (
          <div className="filter-bar-container mb-3" ref={filterBarRef}>
            {/* --- แนวนอน + 2 แถว (มือถือ) --- */}
            <div className="filter-scroll" ref={filterScrollRef}>
              <div className="filter-grid">
                <div
                  className={`filter-item ${
                    activeFilter.type === "all" ? "active" : ""
                  }`}
                  onClick={() => handleSelectFilter({ type: "all" })}
                >
                  <div className="category-icon-wrapper">
                    <span className="icon-text">All</span>
                  </div>
                  <span className="category-name">{t("All")}</span>
                </div>

                <div
                  className={`filter-item ${
                    activeFilter.type === "recommended" ? "active" : ""
                  }`}
                  onClick={() => handleSelectFilter({ type: "recommended" })}
                >
                  {/* <div className="category-icon-wrapper">⭐</div> */}
                  <div className="category-icon-wrapper">
                    <img
                      src={recommendedIcon}
                      alt="Recommended"
                      className="category-icon"
                    />
                  </div>
                  <span className="category-name">{t("Recommended_Products")}</span>
                </div>

                {categories.map((cat) => (
                  <div
                    key={cat.category_id}
                    className={`filter-item ${
                      activeFilter.id === cat.category_id ? "active" : ""
                    }`}
                    onClick={() =>
                      handleSelectFilter({ type: "category", id: cat.category_id })
                    }
                  >
                    <div className="category-icon-wrapper">
                      {cat.icon_url ? (
                        <img
                          src={cat.icon_url}
                          alt={cat.category_name}
                          className="category-icon"
                        />
                      ) : (
                        <span className="icon-placeholder"></span>
                      )}
                    </div>
                    <span className="category-name">
                      {i18n.language === "en" && cat.category_name_en
                        ? cat.category_name_en
                        : cat.category_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator bar (mobile only via CSS) */}
            <div className="scroll-indicator d-md-none">
              <div
                className="scroll-thumb"
                style={thumbStyle}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* === คงกริดเดิมไว้เสมอ + overlay ตอนโหลด === */}
        <div
          ref={productsWrapRef}
          style={{ minHeight: gridMinHeight || undefined, position: "relative" }}
        >
          {isFetching && (
            <div className="grid-overlay">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          <Row xs={2} sm={2} md={3} lg={4} className="g-3 products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <Col key={product.product_id}>
                  <Link
                    to={`/product/${product.product_id}`}
                    className="product-link"
                  >
                    <Card className="product-card h-100">
                      {product.recommend_status === 1 && (
                        <div className="recommend-tag">
                          <BsStarFill className="recommend-star-icon" /> แนะนำ
                        </div>
                      )}

                      <div className="product-image-wrapper">
                        <Card.Img
                          variant="top"
                          src={
                            product.image_url ||
                            "https://via.placeholder.com/300"
                          }
                          className="product-image"
                        />
                      </div>

                      <Card.Body>
                        <Card.Title className="product-title">
                          {i18n.language === "en" && product.name_en
                            ? product.name_en
                            : product.name}
                        </Card.Title>
                        <p className="product-price">
                          {product.price.toLocaleString()} {t("baht")}
                        </p>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Alert variant="light" className="text-center">
                  {t("no_product_found")}
                </Alert>
              </Col>
            )}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default IndexPage;
