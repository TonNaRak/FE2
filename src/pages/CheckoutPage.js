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
import { FaEdit, FaArrowLeft } from "react-icons/fa"; 
import { useTranslation } from "react-i18next";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, refreshUserData } = useAuth();
  const { t, i18n } = useTranslation();

  const { items, subtotal, isBuyNow, shippingCost } = location.state || {
    items: [],
    subtotal: 0,
    isBuyNow: false,
    shippingCost: 0,
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
  const finalTotal = subtotal + (shippingCost || 0) - discount;

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
    // ใช้แต้มได้สูงสุดเท่ากับแต้มที่มี หรือราคาสินค้า หรือ subtotal
    const maxPoints = Math.min(user.points, subtotal);

    if (points > user.points) {
      setPointError("คุณมีแต้มไม่เพียงพอ");
      return;
    }
    if (points > subtotal) {
      // ปรับ logic ตามภาพ: ไม่สามารถใช้เกินราคาสินค้า (subtotal)
      setPointError(`ใช้ได้สูงสุด ${maxPoints.toLocaleString()} แต้ม`);
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
    // 1) ตรวจสต็อกก่อน
    const checkPayload = isBuyNow
      ? { item: { product_id: items[0].product_id, quantity: items[0].quantity } }
      : { items: items.map((it) => ({ product_id: it.product_id, quantity: it.quantity })) };

    const checkRes = await axios.post(
      "https://api.souvenir-from-lagoon-thailand.com/api/orders/check-stock",
      checkPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!checkRes.data?.ok) {
      const problems = checkRes.data?.problems || [];
      const msg = problems
        .map(
          (p) =>
            `${p.name || "Unknown"} — คงเหลือ ${p.available} ชิ้น แต่คุณใส่ ${p.requested}`
        )
        .join("\n");
      alert(`สต็อกไม่พอ:\n\n${msg}`);
      setIsSubmitting(false);
      return;
    }

    // 2) ผ่านแล้วค่อยสร้างคำสั่งซื้อ
    let response;
    const paymentMethod = "online";
    const baseData = {
      paymentMethod,
      shippingInfo,
      pointsToRedeem: discount,
      shippingCost: shippingCost,
    };

    if (isBuyNow) {
      // --- กรณี "ซื้อทันที" ---
      const orderData = {
        ...baseData,
        item: items[0], // ส่งเป็น item object เดียว (มี product_id, quantity, price, selected_options)
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
    alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
    setIsSubmitting(false);
  }
};


  return (
    <div className="checkout-page-bg">
      <Container className="checkout-container">
        {/* === Header ส่วนบน === */}
        <div className="mb-4 p-3 bg-white shadow-sm rounded-3 d-flex align-items-center justify-content-center checkout-header-wrapper">
          {/* ปุ่มย้อนกลับ */}
          <Button
            variant="light"
            onClick={() => navigate(-1)}
            className="checkout-back-circle position-absolute start-0 ms-3 rounded-circle p-0" 
            style={{ width: '40px', height: '40px', left: '0' }} 
          >
            <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm checkout-back-inner-circle" 
                 style={{ width: '40px', height: '40px', backgroundColor: '#068fc6' }} 
            >
                <FaArrowLeft size={20} color="#fff" /> 
            </div>
          </Button>
          <h3 className="mb-0 fw-bold" style={{ color: '#068fc6' }}>{t("checkout_title")}</h3> 
        </div>
        
        {/* ใช้ g-4 เพื่อเพิ่มระยะห่างระหว่าง Col */}
        <Row className="g-4"> 
          <Col lg={8}>
            {/* === ข้อมูลจัดส่ง (Shipping Info) === */}
            <Card className="shadow-sm">
              <Card.Header
                as="h5"
                className="d-flex justify-content-between align-items-center checkout-card-header" 
                style={{ backgroundColor: '#fff', borderBottom: '1px solid #e9ecef' }} 
              >
                {t("shipping_info")}
                {!isEditingAddress && (
                  <Button
                    variant="outline-primary"
                    onClick={handleEditAddress}
                    className="edit-shipping-btn" 
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
                        className="checkout-form-control" 
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>{t("phone_number")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                        className="checkout-form-control" 
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
                        className="checkout-form-control" 
                      />
                    </Form.Group>
                    <div className="text-end">
                      <Button
                        variant="secondary"
                        onClick={handleCancelEdit}
                        className="me-2 checkout-cancel-btn" // ใช้คลาส CSS
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSaveAddress}
                        className="checkout-save-btn" // ใช้คลาส CSS (สีฟ้าถูกกำหนดใน CSS)
                      >
                        {t("save")}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  // ข้อมูลที่แสดงเมื่อไม่ได้แก้ไข
                  <div className="shipping-info-display">
                    <p className="mb-1">
                      <strong>ชื่อผู้รับ:</strong>{" "}
                      {shippingInfo.name}
                    </p>
                    <p className="mb-1">
                      <strong>เบอร์โทรศัพท์:</strong> {shippingInfo.phone}
                    </p>
                    <p className="mb-0">
                      <strong>ที่อยู่:</strong> {shippingInfo.address}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            {/* === รายการสินค้า (Items List) === */}
            <Card className="shadow-sm mt-4"> {/* ใช้ mt-4 เพื่อเว้นระยะห่างด้านบน */}
              <Card.Header as="h5" className="checkout-card-header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e9ecef' }}>
                {t("items_list")} ({items.length})
              </Card.Header>
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item
                    key={item.cart_item_id || item.product_id}
                    className="d-flex justify-content-between align-items-center checkout-item" 
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={item.image_url}
                        rounded
                        className="checkout-item-image" 
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
            {/* === สรุปยอดชำระเงิน (Summary Card) === */}
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <Card.Title as="h5" className="summary-title mb-3">
                  {t("order_summary")}
                </Card.Title>
                <hr className="my-2" />

                {/* --- สรุปยอดปกติ --- */}
                <div className="d-flex justify-content-between mb-1">
                  <span>ราคารวม (Subtotal)</span>
                  <span>
                    {subtotal.toLocaleString()} {t("baht")}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>ค่าจัดส่ง</span>
                  <span>
                    {shippingCost > 0
                      ? `${shippingCost.toLocaleString()} ${t("baht")}`
                      : t("free")}
                  </span>
                </div>
                {/* --- ส่วนลดจากแต้ม --- */}
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>ส่วนลดจากแต้ม</span>
                    <span>
                      - {discount.toLocaleString()} {t("baht")}
                    </span>
                  </div>
                )}
                <hr className="my-2" />

                {/* --- ส่วนใช้แต้มสะสม --- */}
                {user && user.points > 0 && (
                  <>
                    <div className="points-redemption-section p-3 rounded-3 mb-3">
                      <p className="mb-2">
                        <strong style={{ color: '#068fc6' }}>ใช้แต้มสะสม</strong> (คุณมี{" "}
                        <span className="fw-bold text-success">
                          {user.points.toLocaleString()}
                        </span>{" "}
                        แต้ม)
                      </p>
                      {discount > 0 ? (
                        // แสดงเมื่อมีการใช้แต้มแล้ว
                        <div className="d-flex justify-content-between align-items-center">
                          <Alert
                            variant="success"
                            className="py-1 px-3 mb-0 me-2 flex-grow-1"
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
                        // ช่องกรอกแต้ม
                        <InputGroup className="checkout-input-group">
                          {/* ปรับปรุงให้แสดงแต้มสูงสุดตามภาพ */}
                          <p className="text-muted small mb-1 w-100 text-start">
                            ใช้ได้สูงสุด {Math.min(user.points, subtotal).toLocaleString()} แต้ม
                          </p>
                          <Form.Control
                            type="number"
                            placeholder="กรอกจำนวนแต้ม"
                            value={pointsToUse}
                            onChange={(e) => setPointsToUse(e.target.value)}
                            isInvalid={!!pointError}
                            className="text-center" 
                          />
                          <Button
                            variant="primary"
                            onClick={handleApplyPoints}
                            className="points-apply-btn" 
                          >
                            ใช้
                          </Button>
                          {pointError && (
                            <Form.Control.Feedback type="invalid" className="mt-2">
                              {pointError}
                            </Form.Control.Feedback>
                          )}
                        </InputGroup>
                      )}
                    </div>
                  </>
                )}
                
                {/* --- ยอดรวมสุทธิ --- */}
                <div className="d-flex justify-content-between h4 final-total-display">
                  <strong>ยอดรวมทั้งสิ้น</strong>
                  <strong className="text-success">
                    {finalTotal.toLocaleString()} {t("baht")}
                  </strong>
                </div>

                {/* --- ปุ่มยืนยันคำสั่งซื้อ --- */}
                <div className="d-grid mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="confirm-order-btn" 
                  >
                    {isSubmitting ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    ) : (
                      "ยืนยันคำสั่งซื้อ"
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