import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "./CartPage.css";

const CartPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      setError(t("login_prompt_cart"));
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/cart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllItems(response.data);
      setError("");
    } catch (err) {
      setError(t("fetch_cart_fail"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [token]);

  const availableItems = useMemo(
    () => allItems.filter((item) => item.sales_status === 1),
    [allItems]
  );

  const unavailableItems = useMemo(
    () => allItems.filter((item) => item.sales_status === 0),
    [allItems]
  );

  const subtotal = useMemo(() => {
    return availableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [availableItems]);

  const handleProceedToCheckout = () => {
    if (availableItems.length === 0) {
      alert(t("no_items_for_checkout"));
      return;
    }
    navigate("/checkout", {
      state: { items: availableItems, subtotal: subtotal },
    });
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/cart/update/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllItems((prevItems) =>
        prevItems.map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert(t("update_quantity_fail"));
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm(t("confirm_remove_item"))) return;
    try {
      await axios.delete(
        `https://api.souvenir-from-lagoon-thailand.com/api/cart/delete/${cartItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllItems((prevItems) =>
        prevItems.filter((item) => item.cart_item_id !== cartItemId)
      );
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert(t("remove_item_fail"));
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }
  if (!user) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">{t("login_to_view_cart")}</Alert>
        <Button as={Link} to="/login">
          {t("go_to_login")}
        </Button>
      </Container>
    );
  }
  if (allItems.length === 0 && !loading) {
    return (
      <Container className="text-center mt-5">
        <h2>{t("cart_is_empty")}</h2>
        <p>{t("continue_shopping_prompt")}</p>
        <Button as={Link} to="/index">
          {t("back_to_shop")}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="cart-page-container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t("cart_title")}</h1>
        <LanguageSwitcher />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {unavailableItems.length > 0 && (
        <Alert variant="warning">{t("unavailable_items_warning")}</Alert>
      )}

      <Row>
        <Col md={8}>
          {availableItems.length > 0 ? (
            availableItems.map((item) => (
              <Card key={item.cart_item_id} className="mb-3 cart-item-card">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <Image
                        src={item.image_url}
                        fluid
                        rounded
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100";
                        }}
                      />
                    </Col>
                    <Col xs={9} md={4}>
                      {/* --- จุดที่แก้ไข --- */}
                      <h5>
                        {i18n.language === "en" && item.name_en
                          ? item.name_en
                          : item.name}
                      </h5>
                      {item.selected_options &&
                        typeof item.selected_options === "object" && (
                          <div className="text-muted small">
                            {Object.entries(item.selected_options).map(
                              ([key, value]) => (
                                <span key={key} className="me-3">
                                  <strong>{key}:</strong> {value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      <p className="text-muted mb-0">
                        {t("price")}: {item.price.toLocaleString()} {t("baht")}
                      </p>
                    </Col>
                    <Col
                      xs={6}
                      md={3}
                      className="d-flex align-items-center mt-3 mt-md-0"
                    >
                      <Form.Label className="me-2 mb-0">
                        {t("quantity")}:
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.cart_item_id,
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        className="quantity-input"
                      />
                    </Col>
                    <Col xs={4} md={2} className="text-md-end mt-3 mt-md-0">
                      <strong>
                        {(item.price * item.quantity).toLocaleString()}{" "}
                        {t("baht")}
                      </strong>
                    </Col>
                    <Col xs={2} md={1} className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.cart_item_id)}
                      >
                        &times;
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="light">{t("no_available_items")}</Alert>
          )}

          {unavailableItems.length > 0 && (
            <>
              <hr className="my-4" />
              <h5 className="text-muted">{t("unavailable_items")}</h5>
              {unavailableItems.map((item) => (
                <Card
                  key={item.cart_item_id}
                  className="mb-3 cart-item-card unavailable-item"
                >
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={3} md={2}>
                        <Image
                          src={item.image_url}
                          fluid
                          rounded
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                        />
                      </Col>
                      <Col xs={9} md={4}>
                        <h5 className="text-muted">
                          {/* --- จุดที่แก้ไข --- */}
                          <s>
                            {i18n.language === "en" && item.name_en
                              ? item.name_en
                              : item.name}
                          </s>
                        </h5>
                        <p className="text-muted small mb-0">
                          {t("quantity")}: {item.quantity}
                        </p>
                      </Col>
                      <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                        <span className="text-danger me-2">
                          {t("item_unavailable")}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                        >
                          {t("remove")}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </Col>

        <Col md={4}>
          <Card className="summary-card">
            <Card.Body>
              <Card.Title>{t("summary")}</Card.Title>
              <hr />
              <div className="d-flex justify-content-between">
                <span>{t("subtotal")}</span>
                <span>
                  {subtotal.toLocaleString()} {t("baht")}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>{t("shipping")}</span>
                <span>{t("free")}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between h5">
                <strong>{t("total")}</strong>
                <strong>
                  {subtotal.toLocaleString()} {t("baht")}
                </strong>
              </div>
              <div className="d-grid mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  {t("proceed_to_checkout")}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
