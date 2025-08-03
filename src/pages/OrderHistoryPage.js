// src/pages/OrderHistoryPage.js (โค้ดฉบับเต็ม)
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
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!token) {
        setLoading(false);
        setError("กรุณาล็อกอินเพื่อดูประวัติคำสั่งซื้อ");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/orders/my-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderHistory();
  }, [token]);

  const getStatusBadge = (status) => {
    const styles = {
      pending_payment: { bg: "danger", text: "รอชำระเงิน" }, // เพิ่มสถานะใหม่
      pending_verification: { bg: "warning", text: "รอตรวจสอบ" },
      processing: { bg: "info", text: "กำลังจัดเตรียม" },
      shipped: { bg: "primary", text: "จัดส่งแล้ว" },
      completed: { bg: "success", text: "เสร็จสมบูรณ์" },
      cancelled: { bg: "danger", text: "ยกเลิก" },
    };
    return styles[status] || { bg: "secondary", text: status };
  };

  const handleGoToPayment = (orderId) => {
    navigate(`/payment-confirmation/${orderId}`);
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
    <Container className="my-5" style={{ paddingBottom: "80px" }}>
      <h1 className="mb-4">ประวัติคำสั่งซื้อ</h1>
      {orders.length > 0 ? (
        <Accordion>
          {orders.map((order, index) => {
            const badge = getStatusBadge(order.status);
            return (
              <Accordion.Item
                eventKey={index.toString()}
                key={order.order_id}
                className="mb-3 shadow-sm"
              >
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100 align-items-center pe-3">
                    <div>
                      <h5 className="mb-1">คำสั่งซื้อ #{order.order_id}</h5>
                      <p className="text-muted small mb-0">
                        วันที่สั่ง:{" "}
                        {new Date(order.order_date).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <Badge bg={badge.bg} className="fs-6">
                      {badge.text}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <h6>รายการสินค้า ({order.items.length})</h6>
                  <ListGroup variant="flush">
                    {order.items.map((item) => (
                      <ListGroup.Item
                        key={item.order_item_id}
                        className="d-flex align-items-center"
                      >
                        <Image
                          src={item.image_url}
                          thumbnail
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            marginRight: "15px",
                          }}
                        />
                        <div className="flex-grow-1">
                          <strong>{item.product_name}</strong>
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
                  <div className="text-end">
                    <h4>ยอดรวม: {order.total_price.toLocaleString()} บาท</h4>
                    
                    {/* --- ส่วนที่แก้ไข --- */}
                    {/* ถ้าสถานะเป็น 'รอชำระเงิน' ให้แสดงปุ่มนี้ */}
                    {order.status === 'pending_payment' && (
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleGoToPayment(order.order_id)}
                        >
                            ไปที่หน้าชำระเงิน
                        </Button>
                    )}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : (
        <Alert variant="light">คุณยังไม่มีประวัติคำสั่งซื้อ</Alert>
      )}
    </Container>
  );
};

export default OrderHistoryPage;