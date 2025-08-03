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
} from "react-bootstrap";
import axios from "axios";
import "./CheckoutPage.css";
import { FaEdit } from "react-icons/fa";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, refreshUserData } = useAuth();

  // 1. ดึง isBuyNow มาจาก state ที่ส่งมา
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
      }
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">ไม่พบรายการสินค้าในคำสั่งซื้อ</Alert>
        <Button as={Link} to="/cart">
          กลับไปที่ตะกร้าสินค้า
        </Button>
      </Container>
    );
  }

  const total = subtotal;

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

  // 2. แก้ไขฟังก์ชัน handleConfirmOrder ทั้งหมด
  const handleConfirmOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
      alert("กรุณากรอกข้อมูลผู้รับและที่อยู่จัดส่งให้ครบถ้วน");
      setIsEditingAddress(true);
      return;
    }
    try {
      let response;
      const paymentMethod = "online";

      if (isBuyNow) {
        // กรณี "ซื้อทันที"
        const orderData = {
          item: items[0], // ส่งข้อมูลสินค้าแค่ชิ้นเดียว
          totalPrice: total,
          paymentMethod,
          shippingInfo,
        };
        response = await axios.post("https://api.souvenir-from-lagoon-thailand.com/api/orders/buy-now", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // กรณีมาจาก "ตะกร้าสินค้า"
        const orderData = {
          items: items,
          totalPrice: total,
          paymentMethod,
          shippingInfo,
        };
        response = await axios.post("https://api.souvenir-from-lagoon-thailand.com/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const newOrderId = response.data.orderId;
      navigate(`/payment-confirmation/${newOrderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ");
    }
  };

  return (
    <div className="checkout-page-bg">
      <Container className="checkout-container my-5">
        <h1 className="mb-4 text-center">สรุปคำสั่งซื้อ</h1>
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header
                as="h5"
                className="d-flex justify-content-between align-items-center"
              >
                ที่อยู่ในการจัดส่ง
                {!isEditingAddress && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleEditAddress}
                  >
                    <FaEdit className="me-1" /> แก้ไข
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {isEditingAddress ? (
                  <Form>
                    <Form.Group className="mb-2">
                      <Form.Label>ชื่อผู้รับ</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleShippingInfoChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>เบอร์โทรศัพท์</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>ที่อยู่</Form.Label>
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
                        ยกเลิก
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveAddress}
                      >
                        บันทึกที่อยู่
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <p>
                      <strong>ผู้รับ:</strong> {shippingInfo.name}
                    </p>
                    <p>
                      <strong>ที่อยู่:</strong> {shippingInfo.address}
                    </p>
                    <p>
                      <strong>เบอร์โทรศัพท์:</strong> {shippingInfo.phone}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header as="h5">รายการสินค้า ({items.length})</Card.Header>
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
                          <strong>{item.name}</strong>
                        </p>
                        <p className="text-muted small mb-0">
                          จำนวน: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span>
                      {(item.price * item.quantity).toLocaleString()} บาท
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm summary-card">
              <Card.Body>
                <Card.Title as="h5">สรุปยอดชำระเงิน</Card.Title>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>ราคารวม</span>
                  <span>{subtotal.toLocaleString()} บาท</span>
                </div>
                <div className="d-flex justify-content-between text-danger">
                  <span>ส่วนลด</span>
                  <span>- {0} บาท</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>ค่าจัดส่ง</span>
                  <span>ฟรี</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between h5">
                  <strong>ยอดรวมทั้งสิ้น</strong>
                  <strong>{total.toLocaleString()} บาท</strong>
                </div>
                <div className="d-grid mt-4">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleConfirmOrder}
                  >
                    ยืนยันคำสั่งซื้อ
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
