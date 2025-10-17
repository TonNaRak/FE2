// src/pages/admin/StoreSettingPage.js
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
  Table,
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
  BsBank2,
  BsPersonVcard,
  BsCreditCard2Front,
  BsPlus,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import "./StoreSettingPage.css";
import placeholderImage from "../../images/placeholder.png";

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

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
    bank_name: "",
    account_name: "",
    account_number: "",
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

  // === Shipping Rates State ===
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState("");
  const [showRateModal, setShowRateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRateId, setCurrentRateId] = useState(null);
  const [rateForm, setRateForm] = useState({
    min_weight_g: "",
    max_weight_g: "",
    price: "",
  });
  const [rateSaving, setRateSaving] = useState(false);
  const [rateDeleteTarget, setRateDeleteTarget] = useState(null);
  const [rateDeleting, setRateDeleting] = useState(false);

  // === Special Shipping Config (แสดงในตาราง, แก้ผ่าน modal เท่านั้น) ===
  const [cfgLoading, setCfgLoading] = useState(false);
  const [cfgError, setCfgError] = useState("");
  const [cfgSaving, setCfgSaving] = useState(false);
  const [shipCfg, setShipCfg] = useState({
    enable_extra_charge: 1,
    extra_threshold_g: 1000,
    extra_per_kg_price: 20,
  });
  const [showCfgModal, setShowCfgModal] = useState(false);

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  // util สำหรับแสดงผลสวย ๆ
  const fmtInt = (n) => Number(n ?? 0).toLocaleString();
  const fmtMoney = (n) => Number(n ?? 0).toFixed(2);

  // ===== Fetch Store Info =====
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/store-info`);
        if (res.data) {
          setStoreInfo((prev) => ({ ...prev, ...res.data }));
          setImagePreview(res.data.image_url);
          setQrCodePreview(res.data.qr_code_url);
        }
      } catch (err) {
        setError("ไม่สามารถดึงข้อมูลร้านค้าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, [token]);

  // ===== Fetch Shipping Rates =====
  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      setRatesError("");
      const res = await axios.get(`${API_BASE}/api/public/shipping-rates`);
      setRates(res.data || []);
    } catch (e) {
      setRatesError("ไม่สามารถดึงอัตราค่าจัดส่งได้");
    } finally {
      setRatesLoading(false);
    }
  };
  useEffect(() => { fetchRates(); }, []);

  // ===== Fetch Special Shipping Config (admin) =====
  const fetchShippingConfig = async () => {
    try {
      setCfgLoading(true);
      setCfgError("");
      const res = await axios.get(`${API_BASE}/api/admin/shipping-config`, API_CONFIG);
      if (res.data) {
        const { enable_extra_charge, extra_threshold_g, extra_per_kg_price } = res.data;
        setShipCfg({
          enable_extra_charge: Number(enable_extra_charge ?? 0),
          extra_threshold_g: Number(extra_threshold_g ?? 1000),
          extra_per_kg_price: Number(extra_per_kg_price ?? 0),
        });
      }
    } catch (e) {
      setCfgError("ไม่สามารถดึงเกณฑ์พิเศษได้");
    } finally {
      setCfgLoading(false);
    }
  };
  useEffect(() => { fetchShippingConfig(); /* eslint-disable-next-line */ }, []);

  // ===== Handlers: Store Info =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };
  const handleQrCodeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setQrCodeFile(file); setQrCodePreview(URL.createObjectURL(file)); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    Object.keys(storeInfo).forEach((key) => {
      if (storeInfo[key] != null) formData.append(key, storeInfo[key]);
    });
    if (imageFile) formData.append("image", imageFile);
    formData.append("existing_image_url", storeInfo.image_url || "");
    if (qrCodeFile) formData.append("qr_code_file", qrCodeFile);
    formData.append("existing_qr_code_url", storeInfo.qr_code_url || "");

    try {
      await axios.put(`${API_BASE}/api/store-info`, formData, {
        headers: { ...API_CONFIG.headers, "Content-Type": "multipart/form-data" },
      });
      setNotificationMessage({ title: "สำเร็จ", body: "บันทึกข้อมูลร้านค้าสำเร็จ!", variant: "success" });
      setShowNotificationModal(true);
      setImageFile(null);
      setQrCodeFile(null);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ===== Handlers: Shipping Rates =====
  const openAddRate = () => {
    setIsEditing(false);
    setCurrentRateId(null);
    setRateForm({ min_weight_g: "", max_weight_g: "", price: "" });
    setShowRateModal(true);
  };
  const openEditRate = (rate) => {
    setIsEditing(true);
    setCurrentRateId(rate.rate_id);
    setRateForm({
      min_weight_g: String(rate.min_weight_g ?? ""),
      max_weight_g: rate.max_weight_g == null ? "" : String(rate.max_weight_g),
      price: String(rate.price ?? ""),
    });
    setShowRateModal(true);
  };
  const closeRateModal = () => setShowRateModal(false);
  const onRateFormChange = (e) => {
    const { name, value } = e.target;
    if (["min_weight_g", "max_weight_g", "price"].includes(name)) {
      if (name !== "price" && value !== "" && Number(value) < 0) return;
      if (name === "price" && value !== "" && Number(value) < 0) return;
    }
    setRateForm((prev) => ({ ...prev, [name]: value }));
  };
  const saveRate = async () => {
    const payload = {
      min_weight_g: rateForm.min_weight_g === "" ? null : Number(rateForm.min_weight_g),
      max_weight_g: rateForm.max_weight_g === "" ? null : Number(rateForm.max_weight_g),
      price: rateForm.price === "" ? null : Number(rateForm.price),
    };
    if (payload.min_weight_g == null || payload.price == null) {
      setNotificationMessage({ title: "กรอกข้อมูลไม่ครบ", body: "กรุณากรอก Min weight และ Price ให้ครบ", variant: "danger" });
      setShowNotificationModal(true);
      return;
    }
    if (payload.max_weight_g != null && payload.min_weight_g > payload.max_weight_g) {
      setNotificationMessage({ title: "ช่วงน้ำหนักไม่ถูกต้อง", body: "Min weight ต้องน้อยกว่าหรือเท่ากับ Max weight", variant: "danger" });
      setShowNotificationModal(true);
      return;
    }
    try {
      setRateSaving(true);
      if (isEditing && currentRateId != null) {
        await axios.put(`${API_BASE}/api/admin/shipping-rates/${currentRateId}`, payload, API_CONFIG);
        setNotificationMessage({ title: "สำเร็จ", body: "อัปเดตอัตราค่าจัดส่งสำเร็จ", variant: "success" });
      } else {
        await axios.post(`${API_BASE}/api/admin/shipping-rates`, payload, API_CONFIG);
        setNotificationMessage({ title: "สำเร็จ", body: "เพิ่มอัตราค่าจัดส่งสำเร็จ", variant: "success" });
      }
      setShowNotificationModal(true);
      setShowRateModal(false);
      fetchRates();
    } catch (e) {
      const msg = e?.response?.data?.message || (isEditing ? "แก้ไขอัตราค่าจัดส่งไม่สำเร็จ" : "เพิ่มอัตราค่าจัดส่งไม่สำเร็จ");
      setNotificationMessage({ title: "ผิดพลาด", body: msg, variant: "danger" });
      setShowNotificationModal(true);
    } finally {
      setRateSaving(false);
    }
  };
  const confirmDeleteRate = (rate) => setRateDeleteTarget(rate);
  const cancelDeleteRate = () => setRateDeleteTarget(null);
  const deleteRate = async () => {
    if (!rateDeleteTarget) return;
    try {
      setRateDeleting(true);
      await axios.delete(`${API_BASE}/api/admin/shipping-rates/${rateDeleteTarget.rate_id}`, API_CONFIG);
      setNotificationMessage({ title: "สำเร็จ", body: "ลบอัตราค่าจัดส่งสำเร็จ", variant: "success" });
      setShowNotificationModal(true);
      setRateDeleteTarget(null);
      fetchRates();
    } catch (e) {
      setNotificationMessage({ title: "ผิดพลาด", body: e?.response?.data?.message || "ลบอัตราไม่สำเร็จ", variant: "danger" });
      setShowNotificationModal(true);
    } finally {
      setRateDeleting(false);
    }
  };

  // ===== Special Shipping Config (แสดงในตาราง) =====
  const onCfgSwitchToggle = async (e) => {
    const checked = e.target.checked ? 1 : 0;
    setShipCfg((prev) => ({ ...prev, enable_extra_charge: checked }));
    try {
      await axios.put(`${API_BASE}/api/admin/shipping-config`, {
        enable_extra_charge: checked,
        extra_threshold_g: Number(shipCfg.extra_threshold_g) || 1000,
        extra_per_kg_price: Number(shipCfg.extra_per_kg_price) || 0,
      }, API_CONFIG);
    } catch (err) {
      // ถ้าพลาด ให้สลับกลับ
      setShipCfg((prev) => ({ ...prev, enable_extra_charge: prev.enable_extra_charge ? 0 : 1 }));
      setNotificationMessage({
        title: "ผิดพลาด",
        body: "บันทึกสถานะเปิด/ปิด เกณฑ์พิเศษไม่สำเร็จ",
        variant: "danger",
      });
      setShowNotificationModal(true);
    }
  };
  const openCfgModal = () => setShowCfgModal(true);
  const closeCfgModal = () => setShowCfgModal(false);
  const onCfgFormChange = (e) => {
    const { name, value } = e.target;
    if (["extra_threshold_g", "extra_per_kg_price"].includes(name) && value !== "" && Number(value) < 0) return;
    setShipCfg((prev) => ({ ...prev, [name]: value }));
  };
  const saveShippingConfig = async () => {
    try {
      setCfgSaving(true);
      await axios.put(`${API_BASE}/api/admin/shipping-config`, {
        enable_extra_charge: Number(shipCfg.enable_extra_charge) || 0,
        extra_threshold_g: Number(shipCfg.extra_threshold_g) || 1000,
        extra_per_kg_price: Number(shipCfg.extra_per_kg_price) || 0,
      }, API_CONFIG);
      setNotificationMessage({ title: "สำเร็จ", body: "บันทึกเกณฑ์พิเศษการจัดส่งสำเร็จ", variant: "success" });
      setShowNotificationModal(true);
      setShowCfgModal(false);
    } catch (e) {
      setNotificationMessage({ title: "ผิดพลาด", body: e?.response?.data?.message || "บันทึกเกณฑ์พิเศษไม่สำเร็จ", variant: "danger" });
      setShowNotificationModal(true);
    } finally {
      setCfgSaving(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid className="store-settings-page">
      <Form onSubmit={handleFormSubmit}>
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="page-title">ตั้งค่าร้านค้า</h1>
        </div>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

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
                        <Image src={imagePreview || placeholderImage} fluid rounded className="store-image-preview" />
                        <label htmlFor="image-upload" className="image-upload-overlay">
                          <BsUpload size={24} />
                          <span>เปลี่ยนรูปภาพ</span>
                        </label>
                        <Form.Control id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: "none" }} />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>ชื่อร้านค้า (ไทย)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><BsShop /></InputGroup.Text>
                        <Form.Control type="text" name="name" value={storeInfo.name} onChange={handleInputChange} required />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>ชื่อร้านค้า (English)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><BsShop /></InputGroup.Text>
                        <Form.Control type="text" name="name_en" value={storeInfo.name_en || ""} onChange={handleInputChange} />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>เบอร์โทรศัพท์</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><BsTelephone /></InputGroup.Text>
                        <Form.Control type="text" name="phone" value={storeInfo.phone} onChange={handleInputChange} required />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>อีเมลติดต่อ</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><BsEnvelope /></InputGroup.Text>
                        <Form.Control type="email" name="email" value={storeInfo.email} onChange={handleInputChange} required />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>ที่อยู่ร้านค้า (ไทย)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsGeoAlt /></InputGroup.Text>
                    <Form.Control as="textarea" rows={4} name="address" value={storeInfo.address} onChange={handleInputChange} />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>ที่อยู่ร้านค้า (English)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsGeoAlt /></InputGroup.Text>
                    <Form.Control as="textarea" rows={4} name="address_en" value={storeInfo.address_en || ""} onChange={handleInputChange} />
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* === Shipping Rate Management + Special Row (read-only numbers) === */}
            <Card className="settings-card shadow-sm mt-4">
              <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                <span>อัตราค่าจัดส่งตามน้ำหนัก</span>
                <Button variant="primary" size="sm" onClick={openAddRate}>
                  <BsPlus className="me-1" /> เพิ่ม
                </Button>
              </Card.Header>
              <Card.Body>
                {(ratesLoading || cfgLoading) ? (
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" className="me-2" /> กำลังโหลด
                  </div>
                ) : (ratesError || cfgError) ? (
                  <Alert variant="danger">{ratesError || cfgError}</Alert>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead>
                          <tr>
                            <th>น้ำหนัก (g)</th>
                            <th>ค่าจัดส่ง (฿)</th>
                            <th className="text-end" style={{ width: 200 }}>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rates.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center text-muted">ยังไม่มีอัตราค่าจัดส่ง</td>
                            </tr>
                          ) : (
                            rates.map((r) => (
                              <tr key={r.rate_id}>
                                <td>{r.min_weight_g} - {r.max_weight_g == null ? "∞" : r.max_weight_g}</td>
                                <td>{fmtMoney(r.price)}</td>
                                <td className="text-end">
                                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openEditRate(r)}>
                                    <BsPencil />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={() => confirmDeleteRate(r)}>
                                    <BsTrash />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}

                          {/* === SPECIAL RULE ROW (read-only display; edit via modal) === */}
                          <tr className="table-light">
                            <td colSpan={2}>
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                <Form.Check
                                  type="switch"
                                  id="enable-extra"
                                  checked={!!Number(shipCfg.enable_extra_charge)}
                                  onChange={onCfgSwitchToggle}
                                  className="me-2"
                                  label=""
                                />
                                <span>
                                  เกิน <strong>{fmtInt(shipCfg.extra_threshold_g)}</strong> กรัม
                                  &nbsp;คิดเพิ่ม กก.ละ <strong>{fmtMoney(shipCfg.extra_per_kg_price)}</strong> บาท
                                </span>
                              </div>
                            </td>
                            <td className="text-end">
                              <Button variant="outline-secondary" size="sm" onClick={openCfgModal}>
                                <BsPencil className="me-1" /> แก้ไข
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    {/* <div className="text-end">
                      <small className="text-muted">
                        รูปแบบช่วง: 0 - 1000, 1001 - 2000, 2001 - ∞
                      </small>
                    </div> */}
                  </>
                )}
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
                    <InputGroup.Text><BsFacebook /></InputGroup.Text>
                    <Form.Control type="text" name="facebook_url" value={storeInfo.facebook_url || ""} onChange={handleInputChange} placeholder="https://facebook.com" />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>YouTube URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsYoutube /></InputGroup.Text>
                    <Form.Control type="text" name="youtube_url" value={storeInfo.youtube_url || ""} onChange={handleInputChange} placeholder="https://youtube.com" />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Google Maps URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsGeoAlt /></InputGroup.Text>
                    <Form.Control type="text" name="map_url" value={storeInfo.map_url || ""} onChange={handleInputChange} placeholder="https://www.google.com/maps" />
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="settings-card shadow-sm mb-4">
              <Card.Header as="h5">ข้อมูลบัญชีธนาคาร</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อธนาคาร</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsBank2 /></InputGroup.Text>
                    <Form.Control type="text" name="bank_name" value={storeInfo.bank_name || ""} onChange={handleInputChange} />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อบัญชี</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsPersonVcard /></InputGroup.Text>
                    <Form.Control type="text" name="account_name" value={storeInfo.account_name || ""} onChange={handleInputChange} />
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>เลขที่บัญชี</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><BsCreditCard2Front /></InputGroup.Text>
                    <Form.Control type="text" name="account_number" value={storeInfo.account_number || ""} onChange={handleInputChange} />
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="settings-card shadow-sm mb-4">
              <Card.Header as="h5">QR Code สำหรับชำระเงิน</Card.Header>
              <Card.Body className="text-center">
                <div className="qr-upload-wrapper">
                  <Image src={qrCodePreview || placeholderImage} fluid rounded className="qr-image-preview" />
                  <label htmlFor="qr-upload" className="image-upload-overlay">
                    <BsUpload size={24} />
                    <span>เปลี่ยน QR Code</span>
                  </label>
                  <Form.Control id="qr-upload" type="file" accept="image/*" onChange={handleQrCodeFileChange} style={{ display: "none" }} />
                </div>
              </Card.Body>
            </Card>

            <div className="d-grid mt-auto">
              <Button variant="primary" type="submit" size="lg">บันทึกการเปลี่ยนแปลง</Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* ====== Modal: Add/Edit Shipping Rate ====== */}
      <Modal show={showRateModal} onHide={closeRateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "แก้ไขอัตราค่าจัดส่ง" : "เพิ่มอัตราค่าจัดส่ง"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>น้ำหนักต่ำสุด (กรัม) *</Form.Label>
              <Form.Control type="number" min={0} name="min_weight_g" value={rateForm.min_weight_g} onChange={onRateFormChange} placeholder="เช่น 0" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>น้ำหนักสูงสุด (กรัม)</Form.Label>
              <Form.Control type="number" min={0} name="max_weight_g" value={rateForm.max_weight_g} onChange={onRateFormChange} placeholder="เว้นว่าง = ∞ (ช่วงสุดท้าย)" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ราคา (บาท) *</Form.Label>
              <Form.Control type="number" min={0} step="0.01" name="price" value={rateForm.price} onChange={onRateFormChange} placeholder="เช่น 50.00" />
            </Form.Group>
          </Form>
          <small className="text-muted">เคล็ดลับ: ตั้งช่วงไม่ซ้อน เช่น 0–1000, 1001–2000, 2001–∞</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRateModal}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveRate} disabled={rateSaving}>
            {rateSaving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ====== Modal: Edit Special Shipping Config ====== */}
      <Modal show={showCfgModal} onHide={closeCfgModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขเกณฑ์พิเศษการจัดส่ง</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check
              type="switch"
              id="enable-extra-modal"
              label="เปิดใช้การคิดเพิ่มเมื่อเกินเกณฑ์"
              checked={!!Number(shipCfg.enable_extra_charge)}
              onChange={(e) =>
                setShipCfg((prev) => ({ ...prev, enable_extra_charge: e.target.checked ? 1 : 0 }))
              }
              className="mb-3"
            />
            <Form.Group className="mb-3">
              <Form.Label>น้ำหนักเกณฑ์เริ่มคิดเพิ่ม (กรัม)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                name="extra_threshold_g"
                value={shipCfg.extra_threshold_g ?? ""}
                onChange={onCfgFormChange}
                placeholder="เช่น 1000 (1 กก.)"
              />
              <Form.Text className="text-muted">ตัวอย่าง: 1000 = เกิน 1 กก. เริ่มคิดเพิ่ม</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>อัตราคิดเพิ่มต่อกก. (บาท)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                step="0.01"
                name="extra_per_kg_price"
                value={shipCfg.extra_per_kg_price ?? ""}
                onChange={onCfgFormChange}
                placeholder="เช่น 20.00"
              />
              <Form.Text className="text-muted">ระบบจะปัดขึ้นเป็นจำนวนกก.ที่เกิน</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCfgModal}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveShippingConfig} disabled={cfgSaving}>
            {cfgSaving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Global Notification ===== */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className={`text-${notificationMessage.variant}`}>
            {notificationMessage.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{notificationMessage.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowNotificationModal(false)}>ตกลง</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StoreSettingPage;
