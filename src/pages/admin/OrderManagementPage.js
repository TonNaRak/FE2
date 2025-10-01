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
import logo from "../../images/Logo.jpg";

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

  const [isNotifying, setIsNotifying] = useState(false); // State ควบคุมการแสดงฟอร์ม
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  // --- [จุดแก้ไข] อัปเดต Layout ของใบเสร็จทั้งหมด ---
  const handleGenerateReceipt = (order) => {
    const subtotal = order.subtotal || 0;
    const discount = order.discount_amount || 0;
    const total = order.total_price;
    const pointsEarned = order.user_id ? Math.floor(total / 10) : 0;
    const paymentMethodText =
      order.payment_method === "in_store" ? "ชำระเงินหน้าร้าน" : "โอนเงิน";

    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จ #${order.order_id}</title>
          <style>
            body { 
              font-family: 'Sarabun', sans-serif; 
              margin: 20px; 
              color: #212529; /* Darker text for readability */
              font-size: 14px;
            }
            .receipt-container { 
              max-width: 800px; 
              margin: auto; 
              border: 1px solid #dee2e6; /* Lighter border */
              padding: 25px; 
              border-radius: 8px;
            }
            
            /* Header Styles */
            .receipt-header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 25px; 
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .header-left { 
              display: flex; 
              align-items: center; 
            }
            .header-left img { 
              max-width: 70px; /* Slightly smaller logo */
              margin-right: 15px; 
            }
            .header-left p { 
              margin: 0; 
              font-size: 1.1em; /* Adjusted font size */
              font-weight: 600; /* Semi-bold */
              line-height: 1.4;
            }
            .header-right h1 { 
              margin: 0; 
              font-size: 1.6em; /* Adjusted font size */
              font-weight: 700; /* Bold */
            }

            /* Details Styles */
            .details-section { 
              margin-bottom: 25px; 
              border-bottom: 1px solid #eee; 
              padding-bottom: 15px;
            }
            .details-section p { 
              margin: 4px 0; 
              line-height: 1.6;
            }
            
            h5 { 
              border-bottom: 1px solid #dee2e6; 
              padding-bottom: 8px; 
              margin-top: 25px; 
              margin-bottom: 15px;
              font-size: 1.1em;
              font-weight: 600;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #dee2e6; 
              padding: 10px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; /* Lighter header */
              font-weight: 600;
            }
            td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; } /* Align numbers to the right */
            th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }

            /* Total Section Styles */
            .total-section { 
              text-align: right; 
              margin-top: 20px; 
              padding-right: 10px;
            }
            .total-section p { 
              margin: 8px 0; 
              font-size: 1.1em; 
            }
            .total-section hr {
                margin: 8px 0;
                border: 0;
                border-top: 1px solid #dee2e6;
            }
            .total-section h4 { 
              margin: 10px 0 0 0; 
              font-size: 1.3em; 
              font-weight: 700;
            }

            /* Payment Details Styles */
            .payment-details { 
              margin-top: 25px; 
              padding-top: 15px; 
              border-top: 1px solid #eee; 
            }
            .payment-details p {
              margin: 4px 0;
            }

            .print-button { 
              display: block; 
              width: 100px; 
              margin: 25px auto; 
              padding: 10px; 
              background-color: #0d6efd; 
              color: white; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              text-align: center; 
            }
            @media print {
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="header-left">
                <img src="${logo}" alt="Store Logo" />
                <p>ร้านของฝากจากลุ่มน้ำทะเลสาบของไทย<br/>โดย ฟาร์มยายขิ้ม</p>
              </div>
              <div class="header-right">
                <h1>ใบเสร็จรับเงิน</h1>
              </div>
            </div>
            
            <div class="details-section">
                <p><strong>เลขที่คำสั่งซื้อ:</strong> ${order.order_id}</p>
                <p><strong>วันที่:</strong> ${new Date(
                  order.order_date
                ).toLocaleString("th-TH")}</p>
                <br/>
                <p><strong>ลูกค้า:</strong> ${order.shipping_name}</p>
                <p><strong>ที่อยู่:</strong> ${order.shipping_address}</p>
                <p><strong>โทร:</strong> ${order.shipping_phone}</p>
            </div>
            
            <h5>รายการสินค้า</h5>
            <table>
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>จำนวน</th>
                  <th>ราคาต่อหน่วย</th>
                  <th>ราคารวม</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.product_name} ${
                      item.selected_options
                        ? `(${Object.entries(item.selected_options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")})`
                        : ""
                    }</td>
                    <td>${item.quantity}</td>
                    <td>${parseFloat(item.current_price).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )}</td>
                    <td>${(item.quantity * item.current_price).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="total-section">
              <p><strong>ราคารวม:</strong> ${parseFloat(
                subtotal
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })} บาท</p>
              ${
                discount > 0
                  ? `<p style="color: #dc3545;"><strong>ส่วนลด (ใช้ ${
                      order.points_redeemed
                    } แต้ม):</strong> -${parseFloat(discount).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )} บาท</p>`
                  : ""
              }
              <hr/>
              <h4>ยอดสุทธิ: ${parseFloat(total).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })} บาท</h4>
            </div>

            <div class="payment-details">
                <h5>ข้อมูลการชำระเงิน</h5>
                <p><strong>ช่องทาง:</strong> ${paymentMethodText}</p>
                ${
                  order.payment_method === "in_store"
                    ? `
                    <p><strong>รับเงินมา:</strong> ${parseFloat(
                      order.cash_received
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })} บาท</p>
                    <p><strong>เงินทอน:</strong> ${parseFloat(
                      order.change_given
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })} บาท</p>
                `
                    : ""
                }
                ${
                  pointsEarned > 0
                    ? `<p><strong>แต้มที่ได้รับ:</strong> ${pointsEarned} แต้ม</p>`
                    : ""
                }
            </div>

          </div>
          <button class="print-button" onclick="window.print()">พิมพ์</button>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

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
    fetchStatusCounts();
  }, [statusFilter, sortBy]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        API_CONFIG
      );
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

  const handleSendNotification = async () => {
    if (!notificationMessage.trim() || !selectedOrder) {
      alert("กรุณากรอกข้อความที่จะแจ้งเตือน");
      return;
    }
    setIsSending(true);
    try {
      await axios.post(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/${selectedOrder.order_id}/notify-issue`,
        { message: notificationMessage },
        API_CONFIG
      );
      alert("ส่งอีเมลแจ้งเตือนลูกค้าสำเร็จ!");
      setIsNotifying(false); // กลับสู่สถานะปกติ
      setNotificationMessage("");
    } catch (err) {
      alert(
        "เกิดข้อผิดพลาดในการส่งอีเมล: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSending(false);
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
                    <td>{order.username || "Walk-in Customer"}</td>
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
                <strong>ลูกค้า:</strong>{" "}
                {selectedOrder.username || "Walk-in Customer"}
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
              <div className="text-end">
                <p className="mb-1">
                  <strong>ราคารวม:</strong>{" "}
                  {parseFloat(selectedOrder.subtotal).toLocaleString()} บาท
                </p>
                {selectedOrder.discount_amount > 0 && (
                  <p className="mb-1 text-danger">
                    <strong>
                      ส่วนลด (ใช้ {selectedOrder.points_redeemed} แต้ม):
                    </strong>{" "}
                    -
                    {parseFloat(selectedOrder.discount_amount).toLocaleString()}{" "}
                    บาท
                  </p>
                )}
                <hr className="my-2" />
                <h5 className="mb-0">
                  <strong>ยอดสุทธิ:</strong>{" "}
                  {parseFloat(selectedOrder.total_price).toLocaleString()} บาท
                </h5>
              </div>
              <hr />

              {selectedOrder.payment_method === "in_store" ? (
                <div>
                  <h5>ข้อมูลการชำระเงิน (หน้าร้าน)</h5>
                  <p>
                    <strong>รับเงินมา:</strong>{" "}
                    {parseFloat(selectedOrder.cash_received).toLocaleString()}{" "}
                    บาท
                  </p>
                  <p>
                    <strong>เงินทอน:</strong>{" "}
                    {parseFloat(selectedOrder.change_given).toLocaleString()}{" "}
                    บาท
                  </p>
                  <hr />
                </div>
              ) : (
                <div>
                  <h5>หลักฐานการชำระเงิน</h5>
                  {selectedOrder.receipt_image_url ? (
                    <Image
                      src={selectedOrder.receipt_image_url}
                      fluid
                      thumbnail
                      style={{ maxHeight: "400px", cursor: "pointer" }}
                      onClick={() =>
                        viewReceipt(selectedOrder.receipt_image_url)
                      }
                    />
                  ) : (
                    <p>ยังไม่มีการแนบสลิป</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer
          className={`justify-content-between ${
            isNotifying ? "flex-column align-items-stretch" : ""
          }`}
        >
          {isNotifying ? (
            // ---- โหมดแจ้งปัญหา ----
            <>
              <div className="w-100">
                <p className="mb-1">
                  <b>ส่งอีเมลแจ้งปัญหาให้ลูกค้า</b>
                </p>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="เช่น สินค้าหมดสต็อก, ที่อยู่ไม่ชัดเจน, ฯลฯ"
                />
              </div>
              <div className="d-flex justify-content-end w-100 mt-2">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setIsNotifying(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendNotification}
                  disabled={isSending}
                >
                  {isSending ? <Spinner as="span" size="sm" /> : "ส่งอีเมล"}
                </Button>
              </div>
            </>
          ) : (
            // ---- โหมดปกติ ----
            <>
              <div>
                {selectedOrder &&
                  !["completed", "cancelled"].includes(
                    selectedOrder.status
                  ) && (
                    <Button
                      variant="warning"
                      onClick={() => setIsNotifying(true)}
                    >
                      แจ้งปัญหา
                    </Button>
                  )}
              </div>
              <div className="d-flex align-items-center">
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
                {selectedOrder &&
                  ["processing", "shipped", "completed"].includes(
                    selectedOrder.status
                  ) && (
                    <Button
                      variant="info"
                      className="ms-2"
                      onClick={() => handleGenerateReceipt(selectedOrder)}
                    >
                      สร้างใบเสร็จ
                    </Button>
                  )}
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={() => setShowDetailModal(false)}
                >
                  ปิด
                </Button>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagementPage;
