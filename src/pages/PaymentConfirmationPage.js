import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Form,
  Alert,
  Image,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useTranslation } from "react-i18next"; // 1. Import hook

const PaymentConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null); // State ใหม่สำหรับข้อมูลร้าน
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // 2. เรียกใช้ hook

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        // ดึงข้อมูลทั้งสองอย่างพร้อมกันเพื่อประสิทธิภาพ
        const [orderResponse, storeInfoResponse] = await Promise.all([
          axios.get(
            `https://api.souvenir-from-lagoon-thailand.com/api/orders/my-history/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            "https://api.souvenir-from-lagoon-thailand.com/api/store-info"
          ),
        ]);

        setOrder(orderResponse.data);
        setStoreInfo(storeInfoResponse.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลออเดอร์ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId, token]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("กรุณาแนบสลิปการชำระเงิน");
      return;
    }

    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/orders/${orderId}/receipt`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(t("upload_success"));
      setError("");
      setTimeout(() => navigate("/order-history"), 3000);
    } catch (err) {
      setError(t("upload_fail"));
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
    <Container className="my-5" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm">
        <Card.Header as="h4" className="text-center">
          {t("payment_confirmation_title")}
        </Card.Header>
        <Card.Body className="text-center">
          <Card.Title>{t("order_number")}: #{order?.order_id}</Card.Title>
          <p className="h5 my-3">
            {t("amount_due")} {order?.total_price.toLocaleString()} บาท
          </p>
          <p>{t("payment_instructions")}</p>

          {storeInfo && storeInfo.qr_code_url ? (
            <Image
              src={storeInfo.qr_code_url}
              fluid
              style={{ maxWidth: "250px" }}
              className="my-3"
            />
          ) : (
            <Alert variant="secondary" className="my-3">
              {t("qr_code_not_set")}
            </Alert>
          )}

          {message && <Alert variant="success">{message}</Alert>}
          {error && !message && <Alert variant="danger">{error}</Alert>}

          {!message && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t("attach_receipt")}</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={!storeInfo || !storeInfo.qr_code_url}
              >
                {t("confirm_payment_button")}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentConfirmationPage;
