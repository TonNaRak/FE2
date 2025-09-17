import React, { useState, useEffect } from "react";
import {
  Container,
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
  Card,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./OrderManagementPage.css";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("desc");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState("");

  const [statusCounts, setStatusCounts] = useState({});

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStatusCounts = async () => {
    try {
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/status-counts",
        API_CONFIG
      );
      setStatusCounts(response.data);
    } catch (err) {
      console.error("ไม่สามารถดึงข้อมูลจำนวนสถานะได้:", err);
    }
  };

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
    fetchStatusCounts(); // <-- เรียกใช้ฟังก์ชันใหม่ที่นี่
  }, [statusFilter, sortBy]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        API_CONFIG
      );
      // เมื่ออัปเดตสถานะแล้ว ให้ดึงข้อมูลทั้ง 2 อย่างใหม่
      fetchOrders();
      fetchStatusCounts();

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
      pending_payment: { bg: "secondary", text: "รอชำระเงิน" },
      pending_verification: { bg: "warning", text: "รอตรวจสอบ" },
      processing: { bg: "info", text: "กำลังจัดเตรียม" },
      shipped: { bg: "primary", text: "จัดส่งแล้ว" },
      completed: { bg: "success", text: "เสร็จสมบูรณ์" },
      cancelled: { bg: "danger", text: "ยกเลิก" },
    };
    return styles[status] || { bg: "secondary", text: status };
  };

  const totalOrders = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="order-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">จัดการคำสั่งซื้อ</h1>
      </div>

      <Card className="settings-card shadow-sm">
        <Card.Body>
          <Row className="mb-4 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>กรองตามสถานะ:</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">
                    แสดงทั้งหมด {totalOrders > 0 ? `(${totalOrders})` : ""}
                  </option>
                  <option value="pending_payment">
                    รอชำระเงิน{" "}
                    {statusCounts.pending_payment
                      ? `(${statusCounts.pending_payment})`
                      : ""}
                  </option>
                  <option value="pending_verification">
                    รอตรวจสอบ{" "}
                    {statusCounts.pending_verification
                      ? `(${statusCounts.pending_verification})`
                      : ""}
                  </option>
                  <option value="processing">
                    กำลังจัดเตรียม{" "}
                    {statusCounts.processing
                      ? `(${statusCounts.processing})`
                      : ""}
                  </option>
                  <option value="shipped">
                    จัดส่งแล้ว{" "}
                    {statusCounts.shipped ? `(${statusCounts.shipped})` : ""}
                  </option>
                  <option value="completed">
                    เสร็จสมบูรณ์{" "}
                    {statusCounts.completed
                      ? `(${statusCounts.completed})`
                      : ""}
                  </option>
                  <option value="cancelled">
                    ยกเลิก{" "}
                    {statusCounts.cancelled
                      ? `(${statusCounts.cancelled})`
                      : ""}
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="d-flex justify-content-end">
              <Form.Group>
                <Form.Label>เรียงลำดับ:</Form.Label>
                <div>
                  <Button
                    variant={
                      sortBy === "desc" ? "primary" : "outline-secondary"
                    }
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
              </Form.Group>
            </Col>
          </Row>

          <Table hover responsive className="order-table">
            <thead>
              <tr>
                <th className="text-center">ID</th>
                <th className="text-center">ลูกค้า</th>
                <th className="text-center">วันที่สั่ง</th>
                <th className="text-center">ยอดรวม</th>
                <th className="text-center">สถานะ</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.order_id}>
                    <td className="text-center">{order.order_id}</td>
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
                    <td className="text-center">
                      {parseFloat(order.total_price).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <Badge bg={badge.bg}>{badge.text}</Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="primary"
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
        </Card.Body>
      </Card>

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
                      </td>
                      <td>{parseFloat(item.current_price).toLocaleString()}</td>
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
              selectedOrder?.status === "pending_payment") && (
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
    </Container>
  );
};

export default OrderManagementPage;
