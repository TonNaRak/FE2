import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next"; // 1. Import hook
import "./IndexPage.css";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { t, i18n } = useTranslation(); // 2. เรียกใช้ hook

  // อัปเดตข้อความเริ่มต้นให้ใช้ t()
  useEffect(() => {
    setMessage(t("search_prompt"));
  }, [t]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setMessage(t("search_prompt"));
      return;
    }

    setLoading(true);
    setMessage("");

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Endpoint นี้ค้นหาได้ทั้ง TH/EN อยู่แล้ว
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/products/search?q=${searchTerm}`
        );
        setResults(response.data);
        if (response.data.length === 0) {
          setMessage(t("no_results_found", { term: searchTerm }));
        }
      } catch (error) {
        console.error("Search error:", error);
        setMessage(t("search_error"));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, t]);

  return (
    <Container className="my-4" style={{ paddingBottom: "80px" }}>
      <h1 className="mb-4">{t("search_products")}</h1>
      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder={t("search_placeholder")}
          size="lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </Form.Group>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : results.length > 0 ? (
        <Row xs={2} sm={2} md={3} lg={4} className="g-4">
          {results.map((product) => (
            <Col
              key={product.product_id}
              as={Link}
              to={`/product/${product.product_id}`}
              className="product-link"
            >
              <Card className="h-100 product-card shadow-sm">
                <Card.Img
                  variant="top"
                  src={product.image_url || "https://via.placeholder.com/150"}
                  className="product-image"
                />
                <Card.Body className="text-center">
                  {/* 3. เพิ่ม Logic สลับภาษาให้ชื่อสินค้า */}
                  <Card.Title className="product-title">
                    {i18n.language === "en" && product.name_en
                      ? product.name_en
                      : product.name}
                  </Card.Title>
                  <p className="product-price h5 mt-auto">
                    {product.price.toLocaleString()} บาท
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="secondary" className="text-center">
          {message}
        </Alert>
      )}
    </Container>
  );
};

export default SearchPage;
