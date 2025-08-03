import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert, Card, Image } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FaSave } from "react-icons/fa";

const StoreSettingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});

  // State สำหรับไฟล์รูปภาพร้านค้า
  const [selectedFile, setSelectedFile] = useState(null);

  // State ใหม่สำหรับไฟล์ QR Code
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const { token } = useAuth();

  const fetchStoreInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/store-info");
      if (response.data) {
        setFormData(response.data);
      }
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลร้านค้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleQrCodeFileChange = (e) => {
    setQrCodeFile(e.target.files[0]);
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลหลักของร้าน
  const handleSave = async (e) => {
    e.preventDefault();
    const dataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      // ไม่ส่ง qr_code_url ไปกับฟอร์มหลัก
      if (key !== "qr_code_url") {
        dataToSubmit.append(key, formData[key] || "");
      }
    });
    dataToSubmit.append("existing_image_url", formData.image_url || "");
    if (selectedFile) {
      dataToSubmit.append("image", selectedFile);
    }
    try {
      await axios.put("https://api.souvenir-from-lagoon-thailand.com/api/store-info", dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("บันทึกข้อมูลร้านค้าสำเร็จ!");
      setSelectedFile(null);
      fetchStoreInfo(); // รีเฟรชข้อมูลทั้งหมด
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ฟังก์ชันสำหรับอัปโหลด QR Code โดยเฉพาะ
  const handleQrCodeUpload = async () => {
    if (!qrCodeFile) {
      alert("กรุณาเลือกไฟล์ QR Code");
      return;
    }
    const qrFormData = new FormData();
    qrFormData.append("qr_code", qrCodeFile);

    setIsUploadingQr(true);
    try {
      const response = await axios.put("https://api.souvenir-from-lagoon-thailand.com/api/store-info/qr-code", qrFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ ...formData, qr_code_url: response.data.qr_code_url });
      setQrCodeFile(null);
      alert("อัปเดต QR Code สำเร็จ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด QR Code");
    } finally {
      setIsUploadingQr(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h1>ตั้งค่าข้อมูลร้านค้า</h1>
      <p className="text-muted">
        แก้ไขข้อมูลที่จะแสดงผลในหน้า "ตำแหน่งร้านค้า" ของลูกค้า
      </p>
      <Card className="mb-4">
        <Card.Header>
          <h5>ข้อมูลทั่วไปของร้าน</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อร้าน</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ที่อยู่</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เบอร์โทรศัพท์</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>อีเมล</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รูปภาพร้าน</Form.Label>
              {formData.image_url && (
                <div className="mb-2">
                  <p className="mb-1 small text-muted">รูปภาพปัจจุบัน:</p>
                  <Image
                    src={formData.image_url}
                    thumbnail
                    style={{ maxHeight: "150px" }}
                  />
                </div>
              )}
              <Form.Control
                type="file"
                name="image"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                เลือกไฟล์ใหม่เพื่ออัปเดต หรือเว้นว่างไว้เพื่อใช้รูปเดิม
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL เพจ Facebook</Form.Label>
              <Form.Control
                type="text"
                name="facebook_url"
                value={formData.facebook_url || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL ช่อง YouTube</Form.Label>
              <Form.Control
                type="text"
                name="youtube_url"
                value={formData.youtube_url || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL ตำแหน่งร้านค้า (Google Maps Link)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="map_url"
                value={formData.map_url || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="text-end">
              <Button variant="primary" type="submit">
                <FaSave /> บันทึกข้อมูลร้านค้า
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* ส่วนจัดการ QR Code */}
      <Card>
        <Card.Header>
          <h5>จัดการ QR Code สำหรับชำระเงิน</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>QR Code ปัจจุบัน</Form.Label>
            {formData.qr_code_url ? (
              <Image
                src={formData.qr_code_url}
                thumbnail
                style={{ maxHeight: "200px", display: "block" }}
              />
            ) : (
              <p className="text-muted">ยังไม่มีการอัปโหลด QR Code</p>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>อัปโหลด QR Code ใหม่</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control type="file" onChange={handleQrCodeFileChange} />
              <Button
                onClick={handleQrCodeUpload}
                disabled={!qrCodeFile || isUploadingQr}
              >
                {isUploadingQr ? <Spinner size="sm" /> : "อัปโหลด"}
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StoreSettingPage;
