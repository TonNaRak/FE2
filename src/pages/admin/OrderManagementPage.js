import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
  Image,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // ค่าเริ่มต้นคือ 'แสดงทั้งหมด'
  const [sortBy, setSortBy] = useState("desc"); // ค่าเริ่มต้นคือเรียงจาก 'ใหม่ไปเก่า'

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState("");

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter,
        sortBy: sortBy,
      };
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/orders",
        { ...API_CONFIG, params }
      );
      setOrders(response.data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortBy]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        API_CONFIG
      );
      fetchOrders();
      if (showDetailModal) {
        viewOrderDetails(orderId);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const viewReceipt = (imageUrl) => {
    setSelectedReceipt(imageUrl);
    setShowReceiptModal(true);
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/${orderId}`,
        API_CONFIG
      );
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("ไม่สามารถโหลดรายละเอียดออเดอร์ได้");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending_payment: { bg: "secondary", text: "รอชำระเงิน" }, // เพิ่มสถานะนี้
      pending_verification: { bg: "warning", text: "รอตรวจสอบ" },
      processing: { bg: "info", text: "กำลังจัดเตรียม" },
      shipped: { bg: "primary", text: "จัดส่งแล้ว" },
      completed: { bg: "success", text: "เสร็จสมบูรณ์" },
      cancelled: { bg: "danger", text: "ยกเลิก" },
    };
    return styles[status] || { bg: "secondary", text: status };
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h1>จัดการคำสั่งซื้อ</h1>

      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-bold">กรองตามสถานะ</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">แสดงทั้งหมด</option>
              <option value="pending_payment">รอชำระเงิน</option>
              <option value="pending_verification">รอตรวจสอบ</option>
              <option value="processing">กำลังจัดเตรียม</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="completed">เสร็จสมบูรณ์</option>
              <option value="cancelled">ยกเลิก</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex justify-content-end align-items-end">
          <div>
            <Form.Label className="fw-bold">เรียงลำดับ</Form.Label>
            <div>
              <Button
                variant={sortBy === "desc" ? "primary" : "outline-secondary"}
                onClick={() => setSortBy("desc")}
                className="me-2"
              >
                ใหม่ไปเก่า
              </Button>
              <Button
                variant={sortBy === "asc" ? "primary" : "outline-secondary"}
                onClick={() => setSortBy("asc")}
              >
                เก่าไปใหม่
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#ID</th>
            <th>ลูกค้า</th>
            <th>วันที่สั่ง</th>
            <th>ยอดรวม</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.username}</td>
                <td>
                  {new Date(order.order_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{parseFloat(order.total_price).toLocaleString()}</td>
                <td>
                  <Badge bg={badge.bg}>{badge.text}</Badge>
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => viewOrderDetails(order.order_id)}
                  >
                    ดูรายละเอียด
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Modal for viewing receipt */}
      <Modal
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>สลิปการชำระเงิน</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={selectedReceipt} fluid />
        </Modal.Body>
      </Modal>

      {/* Modal for viewing order details */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            รายละเอียดคำสั่งซื้อ #{selectedOrder?.order_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h5>ข้อมูลลูกค้าและการจัดส่ง</h5>
              <p>
                <strong>ลูกค้า:</strong> {selectedOrder.username}
              </p>
              <p>
                <strong>ชื่อผู้รับ:</strong> {selectedOrder.shipping_name}
              </p>
              <p>
                <strong>ที่อยู่สำหรับจัดส่ง:</strong>{" "}
                {selectedOrder.shipping_address}
              </p>
              <p>
                <strong>เบอร์โทรศัพท์ผู้รับ:</strong>{" "}
                {selectedOrder.shipping_phone}
              </p>
              <hr />
              <h5>รายการสินค้าที่ต้องจัดส่ง</h5>
              <Table>
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>ราคาต่อชิ้น (ณ วันที่ซื้อ)</th>
                    <th>จำนวน</th>
                    <th>ราคารวม</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.order_item_id}>
                      <td>
                        {/* --- START: จุดที่แก้ไข --- */}
                        {item.product_name}
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
                        {/* --- END: จุดที่แก้ไข --- */}
                      </td>
                      <td>{parseFloat(item.current_price).toLocaleString()}</td>
                      {/* <td>{item.current_price.toLocaleString()}</td> */}
                      <td>{item.quantity}</td>
                      <td>
                        {(item.current_price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <h5>หลักฐานการชำระเงิน</h5>
              {selectedOrder.receipt_image_url ? (
                <Image
                  src={selectedOrder.receipt_image_url}
                  fluid
                  thumbnail
                  style={{ maxHeight: "400px", cursor: "pointer" }}
                  onClick={() => viewReceipt(selectedOrder.receipt_image_url)}
                />
              ) : (
                <p>ยังไม่มีการแนบสลิป</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            {selectedOrder?.status === "pending_verification" && (
              <Button
                variant="success"
                onClick={() =>
                  handleUpdateStatus(selectedOrder.order_id, "processing")
                }
              >
                ยืนยันการชำระเงิน
              </Button>
            )}
            {selectedOrder?.status === "processing" && (
              <Button
                variant="primary"
                onClick={() =>
                  handleUpdateStatus(selectedOrder.order_id, "shipped")
                }
              >
                แจ้งว่าจัดส่งแล้ว
              </Button>
            )}
            {(selectedOrder?.status === "pending_verification" ||
              selectedOrder?.status === "processing" ||
              selectedOrder?.status === "pending_payment") && ( // เพิ่มเงื่อนไขให้ยกเลิกได้แม้ยังไม่จ่าย
              <Button
                variant="danger"
                className="ms-2"
                onClick={() =>
                  handleUpdateStatus(selectedOrder.order_id, "cancelled")
                }
              >
                ยกเลิกออเดอร์
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagementPage;
