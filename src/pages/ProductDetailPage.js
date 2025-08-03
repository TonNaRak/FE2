import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next"; // 1. Import hook
import LanguageSwitcher from "../components/LanguageSwitcher"; // Import ปุ่มสลับภาษา
import { BsArrowLeft } from "react-icons/bs";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addCartSuccess, setAddCartSuccess] = useState(false);

  const { t, i18n } = useTranslation(); // 2. เรียกใช้ hook
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Endpoint นี้ต้องส่ง name_en และ description_en มาด้วย
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/product/${productId}`
        );
        setProduct(response.data);
      } catch (err) {
        setError("ไม่พบสินค้าหรือเกิดข้อผิดพลาด");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/cart/add",
        { productId: product.product_id, quantity: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddCartSuccess(true);
      setTimeout(() => setAddCartSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า");
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // 1. สร้างโครงสร้างข้อมูลสินค้าชิ้นเดียวให้เหมือนกับตะกร้า
    const itemToBuy = {
      ...product,
      // สร้าง key ชั่วคราวที่ไม่ซ้ำกับในตะกร้าจริง
      cart_item_id: `buynow-${product.product_id}`,
      quantity: quantity,
    };

    // 2. คำนวณราคารวมสำหรับสินค้าชิ้นเดียว
    const subtotal = product.price * quantity;

    // 3. ส่งข้อมูลไปยังหน้า Checkout
    navigate("/checkout", {
      state: { items: [itemToBuy], subtotal: subtotal, isBuyNow: true },
    });
  };

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
  if (!product) return null;

  return (
    <Container className="product-detail-container my-5">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="light" onClick={() => navigate(-1)}>
          <BsArrowLeft /> ย้อนกลับ
        </Button>
        <LanguageSwitcher />
      </div>
      <Row>
        <Col md={6}>
          <Image
            src={product.image_url || "https://via.placeholder.com/600"}
            fluid
            rounded
          />
        </Col>
        <Col md={6}>
          {/* 3. แก้ไขการแสดงผลชื่อและรายละเอียด */}
          <h1 className="product-title">
            {i18n.language === "en" && product.name_en
              ? product.name_en
              : product.name}
          </h1>
          <p className="product-price h2 text-primary">
            {product.price.toLocaleString()} บาท
          </p>
          <p className="product-description lead">
            {i18n.language === "en" && product.description_en
              ? product.description_en
              : product.description}
          </p>

          <hr />

          <Row className="align-items-center my-4">
            <Col xs="auto">
              <Form.Label className="mb-0">จำนวน:</Form.Label>
            </Col>
            <Col xs={4} sm={3}>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value)))
                }
                min="1"
              />
            </Col>
          </Row>

          {addCartSuccess && (
            <Alert variant="success">เพิ่มสินค้าลงตะกร้าเรียบร้อย!</Alert>
          )}

          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={handleAddToCart}>
              {t("add_to_cart")}
            </Button>
            <Button variant="outline-success" size="lg" onClick={handleBuyNow}>
              ซื้อสินค้า
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
