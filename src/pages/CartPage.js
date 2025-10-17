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
  Modal,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaTrashAlt,
  FaMinusCircle,
  FaShoppingCart,
  FaImage,
} from "react-icons/fa";
import "./CartPage.css";

// Placeholder Component
const PlaceholderImage = () => {
  return (
    <div className="placeholder-image-container">
      <FaImage />
    </div>
  );
};

const CartPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removingItems, setRemovingItems] = useState([]);
  const [imageLoaded, setImageLoaded] = useState({});
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [shippingCost, setShippingCost] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      setError(t("login_to_view_cart_prompt"));
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
      setSelectedItems(response.data.filter((item) => item.sales_status === 1));
      setError("");
    } catch (err) {
      setError(t("fetch_cart_fail"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const calculateShipping = async () => {
      const selectedIds = selectedItems.map((item) => item.cart_item_id);

      if (selectedIds.length === 0) {
        setShippingCost(0);
        setTotalWeight(0);
        return;
      }

      try {
        const response = await axios.post(
          `https://api.souvenir-from-lagoon-thailand.com/api/cart/calculate-shipping`,
          { cartItemIds: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShippingCost(response.data.shippingCost);
        setTotalWeight(response.data.totalWeight);
      } catch (error) {
        console.error("Error calculating shipping cost:", error);
        setShippingCost(0);
        setTotalWeight(0);
      }
    };

    if (token) {
      calculateShipping();
    }
  }, [selectedItems, token]);

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
    return selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [selectedItems]);

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert(t("no_items_for_checkout"));
      return;
    }
    navigate("/checkout", {
      state: {
        items: selectedItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
      },
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
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.map((item) =>
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

  const openRemoveModal = (cartItemId) => {
    setItemToRemove(cartItemId);
    setShowModal(true);
  };

  const handleConfirmRemove = async () => {
    setShowModal(false);
    if (!itemToRemove) return;

    setRemovingItems((prev) => [...prev, itemToRemove]);

    try {
      await axios.delete(
        `https://api.souvenir-from-lagoon-thailand.com/api/cart/delete/${itemToRemove}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTimeout(() => {
        setAllItems((prevItems) =>
          prevItems.filter((item) => item.cart_item_id !== itemToRemove)
        );
        setSelectedItems((prevSelectedItems) =>
          prevSelectedItems.filter((item) => item.cart_item_id !== itemToRemove)
        );
        setItemToRemove(null);
        setRemovingItems((prev) => prev.filter((id) => id !== itemToRemove));
      }, 300);
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert(t("remove_item_fail"));
      setRemovingItems((prev) => prev.filter((id) => id !== itemToRemove));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setItemToRemove(null);
  };

  const handleItemSelect = (item, isChecked) => {
    if (isChecked) {
      setSelectedItems((prevSelected) => [...prevSelected, item]);
    } else {
      setSelectedItems((prevSelected) =>
        prevSelected.filter(
          (selectedItem) => selectedItem.cart_item_id !== item.cart_item_id
        )
      );
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedItems(availableItems);
    } else {
      setSelectedItems([]);
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
    <div className="cart-page">
      <Container className="cart-page-container my-1">
        {/* ส่วนหัวแบบ card เหมือนหน้าโปรไฟล์ แต่ไม่มีปุ่มย้อนกลับ */}
        <div className="cart-header mb-4 p-4 bg-white shadow-sm rounded-3">
          <div className="d-flex align-items-center justify-content-center position-relative">
            <h2
              className="w-100 text-center mb-0"
              style={{ color: "#068fc6", fontWeight: 700 }}
            >
              <FaShoppingCart className="me-2" />
              {t("cart_title")}
            </h2>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {unavailableItems.length > 0 && (
          <Alert variant="warning">{t("unavailable_items_warning")}</Alert>
        )}

        <Row>
          <Col md={8}>
            {availableItems.length > 0 && (
              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={t("select_all")}
                  checked={
                    selectedItems.length === availableItems.length &&
                    availableItems.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </div>
            )}
            {availableItems.length > 0 ? (
              availableItems.map((item) => (
                <Card
                  key={item.cart_item_id}
                  className={`mb-3 cart-item-card ${
                    removingItems.includes(item.cart_item_id)
                      ? "is-removing"
                      : ""
                  }`}
                >
                  <Card.Body>
                    <Row className="align-items-center">
                      {/* 1. Checkbox: xs=1, md=1 */}
                      <Col xs={1} md={1} className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.some(
                            (selected) =>
                              selected.cart_item_id === item.cart_item_id
                          )}
                          onChange={(e) =>
                            handleItemSelect(item, e.target.checked)
                          }
                        />
                      </Col>

                      {/* 2. Image: ขยายเป็น xs=4, md=4 */}
                      <Col xs={4} md={4}>
                        {imageLoaded[item.cart_item_id] === false ? (
                          <PlaceholderImage />
                        ) : (
                          <Image
                            src={item.image_url}
                            fluid
                            rounded
                            className="cart-item-image"
                            onLoad={() =>
                              setImageLoaded((prev) => ({
                                ...prev,
                                [item.cart_item_id]: true,
                              }))
                            }
                            onError={() =>
                              setImageLoaded((prev) => ({
                                ...prev,
                                [item.cart_item_id]: false,
                              }))
                            }
                          />
                        )}
                      </Col>

                      {/* 3. Details + Total: ปรับเป็น xs=4, md=4 */}
                      <Col xs={4} md={4}>
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
                        {/* ราคาต่อหน่วย */}
                        <p className="text-muted mb-0">
                          {t("price")}: {item.price.toLocaleString()}{" "}
                          {t("baht")}
                        </p>
                        {/* ยอดรวมทั้งสิ้น (ย้ายมาที่นี่) */}
                        <strong className="d-block">
                          {t("total")}:{" "}
                          {(item.price * item.quantity).toLocaleString()}{" "}
                          {t("baht")}
                        </strong>
                      </Col>

                      {/* 4. Quantity Control: xs=3, md=3 */}
                      <Col xs={3} md={3} className="text-end">
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="quantity-control-group">
                            {/* Conditional Rendering สำหรับปุ่มลบ/ลดจำนวน */}
                            {item.quantity <= 1 ? (
                              <Button
                                variant="light"
                                size="sm"
                                className="quantity-btn"
                                onClick={() =>
                                  openRemoveModal(item.cart_item_id)
                                }
                              >
                                <FaTrashAlt />
                              </Button>
                            ) : (
                              <Button
                                variant="light"
                                size="sm"
                                className="quantity-btn"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.cart_item_id,
                                    item.quantity - 1
                                  )
                                }
                              >
                                -
                              </Button>
                            )}
                            <span className="quantity-display">
                              {item.quantity}
                            </span>
                            <Button
                              variant="light"
                              size="sm"
                              className="quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  item.cart_item_id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
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
                    className={`mb-3 unavailable-item ${
                      removingItems.includes(item.cart_item_id)
                        ? "is-removing"
                        : ""
                    }`}
                  >
                    <Card.Body>
                      <Row className="align-items-center">
                        {/* ปรับเป็น md=3 ให้รูปภาพใหญ่ขึ้น */}
                        <Col xs={3} md={3}>
                          {imageLoaded[item.cart_item_id] === false ? (
                            <PlaceholderImage />
                          ) : (
                            <Image
                              src={item.image_url}
                              fluid
                              rounded
                              className="unavailable-image"
                              onLoad={() =>
                                setImageLoaded((prev) => ({
                                  ...prev,
                                  [item.cart_item_id]: true,
                                }))
                              }
                              onError={() =>
                                setImageLoaded((prev) => ({
                                  ...prev,
                                  [item.cart_item_id]: false,
                                }))
                              }
                            />
                          )}
                        </Col>
                        {/* ปรับเป็น md=6 */}
                        <Col xs={6} md={6}>
                          <h5 className="text-muted">
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
                        {/* คงเดิม md=3 */}
                        <Col xs={3} md={3} className="text-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => openRemoveModal(item.cart_item_id)}
                          >
                            <FaTrashAlt />
                            <span className="ms-2 d-none d-md-inline">
                              {t("remove")}
                            </span>
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
                  <span>
                    {t("subtotal")} ({selectedItems.length} {t("items")})
                  </span>
                  <span>
                    {subtotal.toLocaleString()} {t("baht")}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>
                    {t("shipping_cost")} ({(totalWeight / 1000).toFixed(2)} kg)
                  </span>
                  <span>
                    {shippingCost > 0
                      ? `${shippingCost.toLocaleString()} ${t("baht")}`
                      : t("free")}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between h5">
                  <strong>{t("total")}</strong>
                  <strong>
                    {(subtotal + shippingCost).toLocaleString()} {t("baht")}
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

        {/* Modal สำหรับยืนยันการลบ */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              <FaMinusCircle size={24} className="me-2 text-danger" />
              <span className="text-danger">{t("ลบสินค้าออกจากตระกร้า")}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p>{t("confirm_remove_item")}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleConfirmRemove}>
              {t("remove")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CartPage;
