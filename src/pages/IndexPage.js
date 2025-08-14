import React, { useState, useEffect } from "react";
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
import LanguageSwitcher from "../components/LanguageSwitcher";
import "./IndexPage.css";

const IndexPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState({ type: "all" });
  const [cartMessage, setCartMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  // ฟังก์ชัน handleAddToCart ไม่จำเป็นต้องใช้อีกต่อไปในหน้านี้
  // แต่จะเก็บโค้ดไว้เผื่อคุณอาจจะนำกลับมาใช้ในอนาคต
  /*
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.has_options) {
      navigate(`/product/${product.product_id}`);
      return;
    }

    if (!user) {
      alert("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงตะกร้า");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/cart/add",
        { productId: product.product_id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartMessage(response.data.message);
      setTimeout(() => setCartMessage(""), 2000);
    } catch (error) {
      setCartMessage("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
      setTimeout(() => setCartMessage(""), 2000);
    }
  };
  */

  return (
    <div className="index-page">
      <Container className="py-4">
        <div className="d-flex justify-content-end mb-3">
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
          <div className="filter-bar-container mb-5">
            <div
              className={`filter-item ${
                activeFilter.type === "all" ? "active" : ""
              }`}
              onClick={() => setActiveFilter({ type: "all" })}
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
              onClick={() => setActiveFilter({ type: "recommended" })}
            >
              <div className="category-icon-wrapper">⭐</div>
              <span className="category-name">{t("Recommended_Products")}</span>
            </div>

            {categories.map((cat) => (
              <div
                key={cat.category_id}
                className={`filter-item ${
                  activeFilter.id === cat.category_id ? "active" : ""
                }`}
                onClick={() =>
                  setActiveFilter({ type: "category", id: cat.category_id })
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
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row xs={2} sm={2} md={3} lg={4} className="g-3">
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
        )}
      </Container>
    </div>
  );
};

export default IndexPage;
