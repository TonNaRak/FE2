import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Image,
  InputGroup,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  BsShop,
  BsGeoAlt,
  BsTelephone,
  BsEnvelope,
  BsFacebook,
  BsYoutube,
  BsUpload,
} from "react-icons/bs";
import "./StoreSettingPage.css";
import placeholderImage from "../../images/placeholder.png";

const StoreSettingPage = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    name_en: "",
    address: "",
    address_en: "",
    phone: "",
    email: "",
    image_url: "",
    map_url: "",
    facebook_url: "",
    youtube_url: "",
    qr_code_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [qrCodePreview, setQrCodePreview] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "",
    body: "",
    variant: "success",
  });

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/store-info",
          API_CONFIG
        );
        if (response.data) {
          setStoreInfo((prev) => ({ ...prev, ...response.data }));
          setImagePreview(response.data.image_url);
          setQrCodePreview(response.data.qr_code_url);
        }
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลร้านค้าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleQrCodeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
      setQrCodePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    Object.keys(storeInfo).forEach((key) => {
      if (storeInfo[key] != null) {
        formData.append(key, storeInfo[key]);
      }
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("existing_image_url", storeInfo.image_url || "");

    // --- START: จุดที่แก้ไข ---
    if (qrCodeFile) {
      formData.append("qr_code_file", qrCodeFile);
    }
    // ส่ง URL ของ QR Code เดิมกลับไปด้วยเสมอ
    formData.append("existing_qr_code_url", storeInfo.qr_code_url || "");
    // --- END: จุดที่แก้ไข ---

    try {
      await axios.put(
        "https://api.souvenir-from-lagoon-thailand.com/api/store-info",
        formData,
        API_CONFIG
      );
      setNotificationMessage({
        title: "สำเร็จ",
        body: "บันทึกข้อมูลร้านค้าสำเร็จ!",
        variant: "success",
      });
      setShowNotificationModal(true);
      setImageFile(null);
      setQrCodeFile(null);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid className="store-settings-page">
      <Form onSubmit={handleFormSubmit}>
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="page-title">ตั้งค่าร้านค้า</h1>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <Row className="mt-4 d-flex align-items-stretch">
          <Col lg={8} className="d-flex flex-column">
            <Card className="settings-card shadow-sm flex-grow-1">
              <Card.Header as="h5">ข้อมูลหลักของร้าน</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>โลโก้ / รูปภาพร้านค้า</Form.Label>
                      <div className="image-upload-wrapper">
                        <Image
                          src={imagePreview || placeholderImage}
                          fluid
                          rounded
                          className="store-image-preview"
                        />
                        <label
                          htmlFor="image-upload"
                          className="image-upload-overlay"
                        >
                          <BsUpload size={24} />
                          <span>เปลี่ยนรูปภาพ</span>
                        </label>
                        <Form.Control
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ display: "none" }}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>ชื่อร้านค้า (ไทย)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <BsShop />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="name"
                          value={storeInfo.name}
                          onChange={handleInputChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>ชื่อร้านค้า (English)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <BsShop />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="name_en"
                          value={storeInfo.name_en || ""}
                          onChange={handleInputChange}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>เบอร์โทรศัพท์</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <BsTelephone />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={storeInfo.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>อีเมลติดต่อ</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <BsEnvelope />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={storeInfo.email}
                          onChange={handleInputChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>ที่อยู่ร้านค้า (ไทย)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsGeoAlt />
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="address"
                      value={storeInfo.address}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>ที่อยู่ร้านค้า (English)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsGeoAlt />
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="address_en"
                      value={storeInfo.address_en || ""}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="d-flex flex-column">
            <Card className="settings-card shadow-sm mb-4">
              <Card.Header as="h5">โซเชียลมีเดีย & ลิงก์</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Facebook URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsFacebook />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="facebook_url"
                      value={storeInfo.facebook_url || ""}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>YouTube URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsYoutube />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="youtube_url"
                      value={storeInfo.youtube_url || ""}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com"
                    />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Google Maps URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsGeoAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="map_url"
                      value={storeInfo.map_url || ""}
                      onChange={handleInputChange}
                      placeholder="https://www.google.com/maps"
                    />
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>
            <Card className="settings-card shadow-sm mb-4">
              <Card.Header as="h5">QR Code สำหรับชำระเงิน</Card.Header>
              <Card.Body className="text-center">
                <div className="qr-upload-wrapper">
                  <Image
                    src={qrCodePreview || placeholderImage}
                    fluid
                    rounded
                    className="qr-image-preview"
                  />
                  <label htmlFor="qr-upload" className="image-upload-overlay">
                    <BsUpload size={24} />
                    <span>เปลี่ยน QR Code</span>
                  </label>
                  <Form.Control
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </Card.Body>
            </Card>
            <div className="d-grid mt-auto">
              <Button variant="primary" type="submit" size="lg">
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className={`text-${notificationMessage.variant}`}>
            {notificationMessage.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{notificationMessage.body}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowNotificationModal(false)}
          >
            ตกลง
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StoreSettingPage;
