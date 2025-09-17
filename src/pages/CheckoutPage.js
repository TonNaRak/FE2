import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Alert,
  Image,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import "./CheckoutPage.css";
import { FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, refreshUserData } = useAuth();
  const { t, i18n } = useTranslation();

  const { items, subtotal, isBuyNow } = location.state || {
    items: [],
    subtotal: 0,
    isBuyNow: false,
  };

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalShippingInfo, setOriginalShippingInfo] = useState(null);

  // --- State สำหรับระบบแต้ม ---
  const [pointsToUse, setPointsToUse] = useState("");
  const [pointError, setPointError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (refreshUserData) {
      refreshUserData();
    }
  }, []);

  useEffect(() => {
    if (user) {
      const initialInfo = {
        name: user.username || "",
        phone: user.phone || "",
        address: user.address || "",
      };
      setShippingInfo(initialInfo);
      setOriginalShippingInfo(initialInfo);
      if (!user.address) {
        setIsEditingAddress(true);
      } else {
        setIsEditingAddress(false);
      }
    }
  }, [user]);

  // --- คำนวณราคาสุทธิ ---
  const finalTotal = subtotal - discount;

  if (items.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">{t("no_items_in_order")}</Alert>
        <Button as={Link} to="/cart">
          {t("back_to_shop")}
        </Button>
      </Container>
    );
  }

  const handleShippingInfoChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };
  const handleEditAddress = () => {
    setOriginalShippingInfo(shippingInfo);
    setIsEditingAddress(true);
  };
  const handleCancelEdit = () => {
    setShippingInfo(originalShippingInfo);
    setIsEditingAddress(false);
  };
  const handleSaveAddress = () => {
    setIsEditingAddress(false);
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointsToUse) || 0;
    setPointError("");
    if (points < 0) {
      setPointError("กรุณากรอกแต้มให้ถูกต้อง");
      return;
    }
    if (points > user.points) {
      setPointError("คุณมีแต้มไม่เพียงพอ");
      return;
    }
    if (points > subtotal) {
      setPointError("ไม่สามารถใช้แต้มเกินราคาสินค้าได้");
      return;
    }
    setDiscount(points);
    setPointError("");
  };

  const handleCancelPoints = () => {
    setPointsToUse("");
    setDiscount(0);
    setPointError("");
  };

  // --- [จุดแก้ไขหลัก] แก้ไขฟังก์ชัน handleConfirmOrder ให้แยกการทำงาน ---
  const handleConfirmOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
      alert("กรุณากรอกข้อมูลผู้รับและที่อยู่จัดส่งให้ครบถ้วน");
      setIsEditingAddress(true);
      return;
    }
    setIsSubmitting(true);

    try {
      let response;
      const paymentMethod = "online";
      const baseData = {
        paymentMethod,
        shippingInfo,
        pointsToRedeem: discount,
      };

      if (isBuyNow) {
        // --- กรณี "ซื้อทันที" ---
        const orderData = {
          ...baseData,
          item: items[0], // ส่งเป็น item object เดียว
        };
        response = await axios.post(
          "https://api.souvenir-from-lagoon-thailand.com/api/orders/buy-now",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // --- กรณีมาจาก "ตะกร้าสินค้า" ---
        const orderData = {
          ...baseData,
          items: items, // ส่งเป็น items array
        };
        response = await axios.post(
          "https://api.souvenir-from-lagoon-thailand.com/api/orders",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const newOrderId = response.data.orderId;
      if (refreshUserData) {
        await refreshUserData();
      }
      navigate(`/payment-confirmation/${newOrderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-bg">
      <Container className="checkout-container my-5">
        <h1 className="mb-4 text-center">{t("checkout_title")}</h1>
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header
                as="h5"
                className="d-flex justify-content-between align-items-center"
              >
                {t("shipping_info")}
                {!isEditingAddress && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleEditAddress}
                  >
                    <FaEdit className="me-1" /> {t("edit")}
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {isEditingAddress ? (
                  <Form>
                    <Form.Group className="mb-2">
                      <Form.Label>{t("recipient_name")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleShippingInfoChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>{t("phone_number")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("address")}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                      />
                    </Form.Group>
                    <div className="text-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="me-2"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveAddress}
                      >
                        {t("save")}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <p>
                      <strong>{t("recipient_name")}:</strong>{" "}
                      {shippingInfo.name}
                    </p>
                    <p>
                      <strong>{t("phone_number")}:</strong> {shippingInfo.phone}
                    </p>
                    <p>
                      <strong>{t("address")}:</strong> {shippingInfo.address}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
            <Card className="shadow-sm">
              <Card.Header as="h5">
                {t("items_list")} ({items.length})
              </Card.Header>
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item
                    key={item.cart_item_id || item.product_id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={item.image_url}
                        rounded
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          marginRight: "15px",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/60";
                        }}
                      />
                      <div>
                        <p className="mb-0">
                          <strong>
                            {i18n.language === "en" && item.name_en
                              ? item.name_en
                              : item.name}
                          </strong>
                        </p>
                        {item.selected_options &&
                          typeof item.selected_options === "object" && (
                            <div className="text-muted small">
                              {Object.entries(item.selected_options).map(
                                ([key, value]) => (
                                  <span key={key} className="me-2">
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        <p className="text-muted small mb-0">
                          {t("quantity")} {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span>
                      {(item.price * item.quantity).toLocaleString()}{" "}
                      {t("baht")}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <Card.Title as="h5">{t("order_summary")}</Card.Title>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>{t("subtotal")}</span>
                  <span>
                    {subtotal.toLocaleString()} {t("baht")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="d-flex justify-content-between text-danger">
                    <span>ส่วนลดจากแต้ม</span>
                    <span>
                      - {discount.toLocaleString()} {t("baht")}
                    </span>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span>{t("shipping")}</span>
                  <span>{t("free")}</span>
                </div>
                <hr />

                {user && user.points > 0 && (
                  <>
                    <div className="points-redemption-section">
                      <p className="mb-2">
                        <strong>ใช้แต้มสะสม</strong> (คุณมี{" "}
                        {user.points.toLocaleString()} แต้ม)
                      </p>
                      {discount > 0 ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <Alert
                            variant="success"
                            className="py-2 px-3 mb-0 me-2 flex-grow-1"
                          >
                            ใช้ {discount.toLocaleString()} แต้ม (ลด{" "}
                            {discount.toLocaleString()} บาท)
                          </Alert>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleCancelPoints}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      ) : (
                        <InputGroup>
                          <Form.Control
                            type="number"
                            placeholder="กรอกจำนวนแต้ม"
                            value={pointsToUse}
                            onChange={(e) => setPointsToUse(e.target.value)}
                            isInvalid={!!pointError}
                            max={Math.min(user.points, subtotal)}
                          />
                          <Button variant="primary" onClick={handleApplyPoints}>
                            ใช้
                          </Button>
                          {pointError && (
                            <Form.Control.Feedback type="invalid">
                              {pointError}
                            </Form.Control.Feedback>
                          )}
                        </InputGroup>
                      )}
                    </div>
                    <hr />
                  </>
                )}

                <div className="d-flex justify-content-between h5">
                  <strong>{t("total_amount")}</strong>
                  <strong>
                    {finalTotal.toLocaleString()} {t("baht")}
                  </strong>
                </div>
                <div className="d-grid mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      t("confirm_order")
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CheckoutPage;
