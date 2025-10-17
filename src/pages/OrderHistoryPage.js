import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Accordion,
  ListGroup,
  Image,
  Button,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsBoxSeam, BsCashStack } from "react-icons/bs";
import "./OrderHistoryPage.css";

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";
const PRIMARY_COLOR = "#068fc6";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  // ยืนยันยกเลิก (คงฟังก์ชันเดิม)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!token) {
        setLoading(false);
        setError("กรุณาล็อกอินเพื่อดูประวัติคำสั่งซื้อ");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/api/orders/my-history`,
          authHeader
        );
        setOrders(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // คงฟังก์ชันแสดง Badge เดิม
  const getStatusBadge = (status) => {
    const styles = {
      pending_payment: { bg: "danger", text: "รอชำระเงิน" },
      pending_verification: { bg: "warning", text: "รอตรวจสอบ" },
      processing: { bg: "info", text: "กำลังจัดเตรียม" },
      shipped: { bg: "primary", text: "จัดส่งแล้ว" },
      completed: { bg: "success", text: "เสร็จสมบูรณ์" },
      cancelled: { bg: "secondary", text: "ยกเลิก" },
    };
    return styles[status] || { bg: "secondary", text: status };
  };

  const handleGoToPayment = (orderId) => {
    navigate(`/payment-confirmation/${orderId}`);
  };

  // เปิด modal ยืนยัน (คงเดิม)
  const requestCancel = (order) => {
    setCancelTarget(order);
    setShowCancelModal(true);
  };

  // เรียก API ยกเลิก (ลูกค้า) — เฉพาะ pending_payment (คงเดิม)
  const doCancelOrder = async () => {
    if (!cancelTarget) return;
    try {
      setCanceling(true);
      await axios.put(
        `${API_BASE}/api/orders/${cancelTarget.order_id}/cancel`,
        {},
        authHeader
      );
      const res = await axios.get(
        `${API_BASE}/api/orders/my-history`,
        authHeader
      );
      setOrders(res.data);
      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "ยกเลิกคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setCanceling(false);
    }
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

  return (
    <div className="order-history-page-bg">
      <Container className="order-history-container">
        {/* ===== HEAD แบบเดียวกับไฟล์ดีไซน์ (คงฟังก์ชันเดิมทั้งหมด) ===== */}
        <div className="order-history-header mb-4 p-4 bg-white shadow-sm rounded-3">
          <div className="d-flex align-items-center justify-content-center position-relative">
            {/* ปุ่มย้อนกลับแบบวงกลม */}
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="position-absolute start-0 order-back-circle"
              style={{ color: PRIMARY_COLOR, zIndex: 10 }}
            >
              <div
                className="p-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  width: "40px",
                  height: "40px",
                }}
              >
                <BsArrowLeft
                  className="text-white"
                  style={{ fontSize: "1.2rem" }}
                />
              </div>
            </Button>

            {/* หัวข้อหลัก */}
            <h2
              className="w-100 text-center mb-0"
              style={{ color: PRIMARY_COLOR, fontWeight: 700 }}
            >
              ประวัติคำสั่งซื้อ
            </h2>
          </div>
        </div>
        {/* ============================================================ */}

        {orders.length > 0 ? (
          <Accordion alwaysOpen className="order-accordion-list">
            {orders.map((order, index) => {
              const badge = getStatusBadge(order.status);
              const isPendingPayment = order.status === "pending_payment";
              return (
                <Accordion.Item
                  eventKey={order.order_id.toString()}
                  key={order.order_id}
                  className="mb-3 order-item-card"
                >
                  <Accordion.Header className="order-accordion-header">
                    <div className="d-flex justify-content-between w-100 align-items-center pe-3">
                      <div>
                        <h5 className="mb-1 fw-bold">
                          คำสั่งซื้อ #{order.order_id}
                        </h5>
                        <p className="text-muted small mb-0">
                          วันที่สั่ง:{" "}
                          {new Date(order.order_date).toLocaleDateString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                      <Badge bg={badge.bg} className="fs-6 order-status-badge">
                        {badge.text}
                      </Badge>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="order-accordion-body">
                    <h6>รายการสินค้า ({order.items.length})</h6>
                    <ListGroup variant="flush" className="order-item-list">
                      {order.items.map((item) => (
                        <ListGroup.Item
                          key={item.order_item_id}
                          className="d-flex align-items-center order-product-item"
                        >
                          <Image
                            src={item.image_url}
                            thumbnail
                            className="order-product-image"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              marginRight: "15px",
                            }}
                          />
                          <div className="flex-grow-1 order-product-details">
                            <strong>{item.product_name}</strong>
                            {item.selected_options &&
                              typeof item.selected_options === "object" && (
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {Object.entries(item.selected_options).map(
                                    ([key, value]) => (
                                      <div key={key}>
                                        <small>
                                          {key}: {value}
                                        </small>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            <p className="text-muted small mb-0">
                              {item.quantity} x{" "}
                              {item.current_price.toLocaleString()} บาท
                            </p>
                          </div>
                          <strong>
                            {(
                              item.quantity * item.current_price
                            ).toLocaleString()}{" "}
                            บาท
                          </strong>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <hr />
                    <div className="d-flex flex-wrap justify-content-between align-items-end">
                      <div>{/* ฝั่งซ้าย: เผื่อรายละเอียดอื่นในอนาคต */}</div>
                      <div className="text-end">
                        {/* ✅ แสดงราคารวมเสมอ */}
                        <p className="mb-1">
                          ราคารวม:{" "}
                          {parseFloat(order.subtotal ?? 0).toLocaleString()} บาท
                        </p>

                        {/* ✅ แสดงส่วนลดเฉพาะเมื่อมี */}
                        {Number(order.discount_amount) > 0 && (
                          <p className="mb-1 text-danger">
                            ส่วนลด: -
                            {parseFloat(order.discount_amount).toLocaleString()}{" "}
                            บาท
                          </p>
                        )}

                        {/* (ถ้ามี) ค่าจัดส่ง */}
                        {Number(order.shipping_cost) > 0 && (
                          <p className="mb-1 text-muted">
                            ค่าจัดส่ง:{" "}
                            {parseFloat(order.shipping_cost).toLocaleString()}{" "}
                            บาท
                          </p>
                        )}

                        {/* ✅ ยอดสุทธิ */}
                        <h4 className="mb-2">
                          ยอดสุทธิ:{" "}
                          {parseFloat(order.total_price ?? 0).toLocaleString()}{" "}
                          บาท
                        </h4>

                        {/* ปุ่มไปหน้าชำระเงิน (เฉพาะรอชำระ) */}
                        {isPendingPayment && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="custom-equal-btn me-2"
                            onClick={() => handleGoToPayment(order.order_id)}
                          >
                            ไปที่หน้าชำระเงิน
                          </Button>
                        )}

                        {/* ปุ่มยกเลิกออเดอร์ (ลูกค้า) — เฉพาะรอชำระเงิน */}
                        {isPendingPayment && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="custom-equal-btn"
                            onClick={() => requestCancel(order)}
                          >
                            ยกเลิกออเดอร์
                          </Button>
                        )}
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        ) : (
          <Alert variant="light">
            <BsBoxSeam className="me-2" />
            คุณยังไม่มีประวัติคำสั่งซื้อ
          </Alert>
        )}

        {/* Modal ยืนยันยกเลิก (คงเดิม) */}
        <Modal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>ยืนยันการยกเลิกออเดอร์</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ต้องการยกเลิกคำสั่งซื้อ #{cancelTarget?.order_id} ใช่หรือไม่?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              ย้อนกลับ
            </Button>
            <Button
              variant="danger"
              onClick={doCancelOrder}
              disabled={canceling}
            >
              {canceling ? <Spinner as="span" size="sm" /> : "ยืนยันยกเลิก"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default OrderHistoryPage;
