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

        const initialOptions = {};
        if (response.data.options && response.data.options.length > 0) {
          response.data.options.forEach((opt) => {
            initialOptions[opt.option_name] = "";
          });
        }
        setSelectedOptions(initialOptions);
      } catch (err) {
        setError(t("product_not_found"));
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

  const handleAction = async (actionType) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        if (!selectedOptions[option.option_name]) {
          showNotification(
            t("please_select_option"),
            `${t("please_select")} "${
              i18n.language === "en" && option.option_name_en
                ? option.option_name_en
                : option.option_name
            }"`,
            "warning"
          );
          return;
        }
      }
    }

    if (actionType === "addToCart") {
      try {
        await axios.post(
          "https://api.souvenir-from-lagoon-thailand.com/api/cart/add",
          {
            productId: product.product_id,
            quantity: quantity,
            selectedOptions,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification(
          t("added_to_cart_success_title"),
          t("added_to_cart_success_body", {
            productName:
              i18n.language === "en" && product.name_en
                ? product.name_en
                : product.name,
            quantity: quantity,
          })
        );
      } catch (err) {
        console.error("Failed to add to cart:", err);
        showNotification(
          t("add_to_cart_fail_title"),
          t("add_to_cart_fail_body"),
          "danger"
        );
      }
    } else if (actionType === "buyNow") {
      const itemToBuy = {
        ...product,
        cart_item_id: `buynow-${product.product_id}`,
        quantity: quantity,
        selected_options: selectedOptions,
      };
      const subtotal = product.price * quantity;
      navigate("/checkout", {
        state: { items: [itemToBuy], subtotal: subtotal, isBuyNow: true },
      });
    }
  };

  const ProductInfoContent = () => (
    <>
      <h1 className="product-title-detail">
        {i18n.language === "en" && product.name_en
          ? product.name_en
          : product.name}
      </h1>
      <p className="product-price-detail">
        {product.price.toLocaleString()} {t("baht")}
      </p>
      <p className="product-description">
        {i18n.language === "en" && product.description_en
          ? product.description_en
          : product.description}
      </p>
      <hr />

      {product.options && product.options.length > 0 && (
        <div className="my-4">
          {product.options.map((option) => {
            const labelText =
              i18n.language === "en" && option.option_name_en
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
                    aria-label={`${t("please_select")} ${labelText}`}
                  >
                    {option.values.map((val) => {
                      const valueText =
                        i18n.language === "en" && val.value_name_en
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
          <Form.Label className="mb-0">{t("quantity_label")}</Form.Label>
        </Col>
        <Col xs="auto">
          <div
            className="quantity-stepper"
            role="group"
            aria-label={t("quantity_label")}
          >
            <button
              type="button"
              className="qty-btn"
              onClick={decrementQuantity}
              aria-label={t("remove")}
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
              aria-label={t("add_to_cart")}
            >
              +
            </button>
          </div>
        </Col>
      </Row>
    </>
  );

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
              onClick={() => handleAction("buyNow")}
            >
              {t("buy_now")}
            </Button>
            <Button
              variant="outline-primary"
              className="mobile-cart-btn"
              onClick={() => handleAction("addToCart")}
            >
              <span>{t("add_to_cart_mobile")}</span>
            </Button>
            
          </div>
        </div>
      );
    }

    return (
      <Container className={`product-detail-container my-5`}>
        {/* <div className="d-flex justify-content-between align-items-center mb-4">
          <Button className="glass-btn" onClick={() => navigate(-1)}>
            <BsArrowLeft className="me-2" /> {t("back_button")}
          </Button>
          <Button className="glass-btn" onClick={() => navigate("/cart")}>
            <BsCart className="me-2" /> {t("go_to_cart")}
          </Button>
        </div> */}
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
                onClick={() => handleAction("addToCart")}
                className="add-to-cart-button"
              >
                {t("add_to_cart")}
              </Button>
              <Button
                variant="outline-success"
                size="lg"
                onClick={() => handleAction("buyNow")}
              >
                {t("buy_now")}
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

      {/* Notification Modal */}
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
