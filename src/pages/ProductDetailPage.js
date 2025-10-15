// src/pages/ProductDetailPage.jsx
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
  Modal,
  ModalBody,
  ModalHeader,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  BsArrowLeft,
  BsCart,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import useMediaQuery from "../hooks/useMediaQuery";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);

  // ป้องกันกดซ้ำ (ฟังก์ชันเดิม)
  const [isProcessing, setIsProcessing] = useState(false);

  // Notification Modal (ฟังก์ชันเดิม)
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notification, setNotification] = useState({
    title: "",
    body: "",
    variant: "success",
  });

  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleShowImageModal = () => setShowImageModal(true);
  const handleCloseImageModal = () => setShowImageModal(false);

  const showNotification = (title, body, variant = "success") => {
    setNotification({ title, body, variant });
    setShowNotificationModal(true);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/product/${productId}`
        );
        setProduct(response.data);

        // กำหนดค่าเริ่มต้นของ options (ตามหน้าตาเวอร์ชันล่าง)
        const initial = {};
        if (response.data.options && response.data.options.length > 0) {
          response.data.options.forEach((opt) => {
            initial[opt.option_name] = "";
          });
        }
        setSelectedOptions(initial);
      } catch (err) {
        setError(t("product_not_found") || "ไม่สามารถโหลดข้อมูลสินค้าได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, t]);

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const incrementQuantity = () =>
    setQuantity((q) => (Number.isFinite(q) ? q + 1 : 1));
  const decrementQuantity = () =>
    setQuantity((q) => (Number.isFinite(q) && q > 1 ? q - 1 : 1));

  // ---------- ฟังก์ชันเดิม: Add to Cart ----------
  const handleAddToCart = async () => {
    if (!user) {
      showNotification(
        t("login_required") || "ต้องเข้าสู่ระบบ",
        t("please_login_to_add_to_cart") || "กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าในตะกร้า",
        "warning"
      );
      return;
    }

    const hasOptions = product.options && product.options.length > 0;
    if (hasOptions) {
      const allSelected = product.options.every(
        (opt) => selectedOptions[opt.option_name]
      );
      if (!allSelected) {
        showNotification(
          t("please_select_options") || "กรุณาเลือกตัวเลือกสินค้า",
          t("product_options_must_be_selected") || "ต้องเลือกตัวเลือกสินค้าก่อน",
          "warning"
        );
        return;
      }
    }

    try {
      await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/cart/add",
        {
          productId: product.product_id,
          quantity,
          selectedOptions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showNotification(
        t("add_to_cart_success") || "เพิ่มลงตะกร้าสำเร็จ",
        t("product_added_to_cart") || "สินค้าได้ถูกเพิ่มลงตะกร้าแล้ว",
        "success"
      );
    } catch (err) {
      console.error("Add to cart error:", err);
      showNotification(
        t("error") || "เกิดข้อผิดพลาด",
        t("add_to_cart_fail") || "เพิ่มสินค้าในตะกร้าไม่สำเร็จ",
        "danger"
      );
    }
  };

  // ---------- ฟังก์ชันเดิม: Buy Now (คำนวณค่าส่ง + ป้องกันกดซ้ำ) ----------
  const handleBuyNow = async () => {
    if (isProcessing) return;

    if (!user) {
      showNotification(
        t("login_required") || "ต้องเข้าสู่ระบบ",
        t("please_login_to_buy") || "กรุณาเข้าสู่ระบบเพื่อสั่งซื้อ",
        "warning"
      );
      return;
    }

    const hasOptions = product.options && product.options.length > 0;
    if (hasOptions) {
      const allSelected = product.options.every(
        (opt) => selectedOptions[opt.option_name]
      );
      if (!allSelected) {
        showNotification(
          t("please_select_options") || "กรุณาเลือกตัวเลือกสินค้า",
          t("product_options_must_be_selected") || "ต้องเลือกตัวเลือกสินค้าก่อน",
          "warning"
        );
        return;
      }
    }

    setIsProcessing(true);
    try {
      // เรียก API คำนวณค่าส่ง (ฟังก์ชันเดิม)
      const shippingResponse = await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/products/calculate-shipping",
        {
          items: [{ product_id: product.product_id, quantity }],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { shippingCost } = shippingResponse.data;

      const currentLanguage = i18n.language;
      const itemToCheckout = {
        product_id: product.product_id,
        name: product.name,
        name_en: product.name_en,
        price: product.price,
        image_url: product.image_url,
        quantity,
        selected_options: selectedOptions,
        weight: product.weight,
        // เผื่อใช้ชื่อที่ตรงภาษาปัจจุบัน
        display_name:
          currentLanguage === "th"
            ? product.name
            : product.name_en || product.name,
      };

      navigate("/checkout", {
        state: {
          items: [itemToCheckout],
          subtotal: itemToCheckout.price * itemToCheckout.quantity,
          isBuyNow: true,
          shippingCost, // ส่งไปพร้อมกัน
        },
      });
    } catch (err) {
      console.error("Buy Now Error:", err);
      showNotification(
        t("error") || "เกิดข้อผิดพลาด",
        t("shipping_calculate_failed") || "เกิดข้อผิดพลาดในการคำนวณค่าจัดส่ง",
        "danger"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- Render ----------
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

  const currentLanguage = i18n.language;
  const productName =
    currentLanguage === "th" ? product.name : product.name_en || product.name;
  const productDescription =
    currentLanguage === "th"
      ? product.description
      : product.description_en || product.description;

  // --- ส่วนย่อย: ข้อมูลสินค้า (UI แบบเวอร์ชันล่าง) ---
  const ProductInfoContent = () => (
    <>
      <h1 className="product-title-detail">{productName}</h1>
      <p className="product-price-detail">
        {product.price.toLocaleString()} {t("baht")}
      </p>

      {/* ใช้ HTML จาก backend เช่นเดิม แต่คงหน้าตา/ตำแหน่งแบบเวอร์ชันล่าง */}
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: productDescription }}
      />

      <hr />

      {product.options && product.options.length > 0 && (
        <div className="my-4">
          {product.options.map((option) => {
            const labelText =
              currentLanguage === "en" && option.option_name_en
                ? option.option_name_en
                : option.option_name;

            return (
              <Form.Group
                key={option.option_id}
                as={Row}
                className="mb-3 align-items-center"
              >
                <Form.Label column sm={3} className="fw-bold">
                  {labelText}:
                </Form.Label>
                <Col sm={9}>
                  <div
                    className="option-tiles"
                    role="group"
                    aria-label={`${t("please_select") || "กรุณาเลือก"} ${labelText}`}
                  >
                    {option.values.map((val) => {
                      const valueText =
                        currentLanguage === "en" && val.value_name_en
                          ? val.value_name_en
                          : val.value_name;
                      const isActive =
                        selectedOptions[option.option_name] === val.value_name;

                      return (
                        <button
                          key={val.value_id}
                          type="button"
                          className={`tile-btn ${isActive ? "active" : ""}`}
                          onClick={() =>
                            handleOptionChange(
                              option.option_name,
                              val.value_name
                            )
                          }
                          aria-pressed={isActive}
                        >
                          {valueText}
                        </button>
                      );
                    })}
                  </div>
                </Col>
              </Form.Group>
            );
          })}
        </div>
      )}

      <Row className="align-items-center my-4">
        <Col xs="auto" className="fw-bold">
          <Form.Label className="mb-0">
            {t("quantity_label") || "จำนวน"}
          </Form.Label>
        </Col>
        <Col xs="auto">
          <div
            className="quantity-stepper"
            role="group"
            aria-label={t("quantity_label") || "จำนวน"}
          >
            <button
              type="button"
              className="qty-btn"
              onClick={decrementQuantity}
              aria-label={t("remove") || "ลดจำนวน"}
              disabled={isProcessing}
            >
              -
            </button>
            <div className="qty-value" aria-live="polite">
              {quantity}
            </div>
            <button
              type="button"
              className="qty-btn"
              onClick={incrementQuantity}
              aria-label={t("add_to_cart") || "เพิ่ม"}
              disabled={isProcessing}
            >
              +
            </button>
          </div>
        </Col>
      </Row>
    </>
  );

  // --- ส่วนหลัก: แยก Mobile / Desktop (UI แบบเวอร์ชันล่าง) ---
  const MainContent = () => {
    if (isMobile) {
      return (
        <div className="mobile-product-page">
          <div className="mobile-header">
            <Button className="glass-btn" onClick={() => navigate(-1)}>
              <BsArrowLeft size={20} />
            </Button>
            <Button className="glass-btn" onClick={() => navigate("/cart")}>
              <BsCart size={20} />
            </Button>
          </div>

          <Image
            src={product.image_url || "https://via.placeholder.com/600"}
            fluid
            className="mobile-product-image"
            onClick={handleShowImageModal}
          />

          <div className="mobile-info-container">
            <ProductInfoContent />
          </div>

          <div className="mobile-action-bar">
            <Button
              variant="success"
              className="mobile-buy-btn"
              onClick={handleBuyNow}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner size="sm" /> : t("buy_now")}
            </Button>
            <Button
              variant="outline-primary"
              className="mobile-cart-btn"
              onClick={handleAddToCart}
              disabled={isProcessing}
            >
              <span>{t("add_to_cart_mobile") || t("add_to_cart")}</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Container className="product-detail-container my-5">
        <Row>
          <Col md={6}>
            <Image
              src={product.image_url || "https://via.placeholder.com/600"}
              fluid
              rounded
              className="product-main-image"
              onClick={handleShowImageModal}
            />
          </Col>
          <Col md={6} className="product-info">
            <ProductInfoContent />
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className="add-to-cart-button"
                disabled={isProcessing}
              >
                {t("add_to_cart")}
              </Button>
              <Button
                variant="outline-success"
                size="lg"
                onClick={handleBuyNow}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  t("buy_now")
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  };

  return (
    <>
      <MainContent />

      {/* Modal รูปภาพ */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        size="lg"
        centered
        dialogClassName="image-modal"
      >
        <ModalHeader closeButton className="image-modal-header"></ModalHeader>
        <ModalBody className="p-0 text-center">
          {product && <Image src={product.image_url} fluid />}
        </ModalBody>
      </Modal>

      {/* Notification Modal (ฟังก์ชันเดิม) */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            className={`d-flex align-items-center text-${notification.variant}`}
          >
            {notification.variant === "success" && (
              <BsCheckCircleFill className="me-2" />
            )}
            {notification.variant === "warning" && (
              <BsExclamationTriangleFill className="me-2" />
            )}
            {notification.variant === "danger" && (
              <BsExclamationTriangleFill className="me-2" />
            )}
            {notification.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{notification.body}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowNotificationModal(false)}
          >
            {t("ok")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductDetailPage;
