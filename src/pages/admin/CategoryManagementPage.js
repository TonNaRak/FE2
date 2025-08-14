import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Image, // <-- เพิ่ม Image component
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- START: จุดที่แก้ไข ---
  // 1. อัปเดต State ให้มี icon_url
  const [currentCategory, setCurrentCategory] = useState({
    category_id: null,
    category_name: "",
    category_name_en: "",
    icon_url: "", // เพิ่ม field นี้
  });
  // 2. เพิ่ม State สำหรับเก็บไฟล์ที่เลือก
  const [selectedFile, setSelectedFile] = useState(null);
  // --- END: จุดที่แก้ไข ---

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // ใช้ /api/admin/categories endpoint ใหม่ (ถ้ามี) หรืออันเดิมก็ได้
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/categories",
        API_CONFIG
      );
      setCategories(response.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้ หรือคุณไม่มีสิทธิ์เข้าถึง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleShowAddModal = () => {
    setIsEditMode(false);
    // 3. อัปเดต State เริ่มต้นสำหรับเพิ่มข้อมูลใหม่
    setCurrentCategory({
      category_id: null,
      category_name: "",
      category_name_en: "",
      icon_url: "",
    });
    setSelectedFile(null); // เคลียร์ไฟล์ที่เลือกไว้
    setShowModal(true);
  };

  const handleShowEditModal = (category) => {
    setIsEditMode(true);
    setCurrentCategory(category);
    setSelectedFile(null); // เคลียร์ไฟล์ที่เลือกไว้
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // --- START: จุดที่แก้ไข ---
  // 4. เพิ่ม function สำหรับจัดการไฟล์ที่เลือก
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // 5. แก้ไข handleSave ให้รองรับการส่งไฟล์ (FormData)
  const handleSave = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_name", currentCategory.category_name);
    formData.append("category_name_en", currentCategory.category_name_en);

    // ถ้ามีการเลือกไฟล์ใหม่ ให้เพิ่มเข้าไปใน formData
    if (selectedFile) {
      formData.append("icon", selectedFile);
    }
    // ถ้าเป็นการแก้ไข ให้ส่ง URL ของไอคอนเดิมไปด้วย
    if (isEditMode) {
      formData.append("existing_icon_url", currentCategory.icon_url || "");
    }

    const apiEndpoint = isEditMode
      ? `https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${currentCategory.category_id}`
      : "https://api.souvenir-from-lagoon-thailand.com/api/admin/categories";
    const apiMethod = isEditMode ? "put" : "post";

    try {
      // ส่งข้อมูลเป็น formData
      await axios[apiMethod](apiEndpoint, formData, API_CONFIG);
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      alert(
        `เกิดข้อผิดพลาด: ${err.response?.data?.message || "โปรดลองอีกครั้ง"}`
      );
    }
  };
  // --- END: จุดที่แก้ไข ---

  const handleDelete = async (categoryId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสินค้านี้?")) {
      try {
        await axios.delete(
          `https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${categoryId}`,
          API_CONFIG
        );
        fetchCategories();
      } catch (err) {
        alert(
          `เกิดข้อผิดพลาด: ${err.response?.data?.message || "โปรดลองอีกครั้ง"}`
        );
      }
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>จัดการประเภทสินค้า</h1>
        <Button onClick={handleShowAddModal}>
          <FaPlus /> เพิ่มประเภทใหม่
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#ID</th>
            {/* --- START: จุดที่แก้ไข --- */}
            <th>ไอคอน</th>
            {/* --- END: จุดที่แก้ไข --- */}
            <th>ชื่อประเภท (ไทย)</th>
            <th>ชื่อประเภท (English)</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.category_id}>
              <td>{cat.category_id}</td>
              <td>
                <Image
                  src={cat.icon_url}
                  thumbnail
                  style={{
                    maxHeight: "40px",
                    maxWidth: "40px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </td>
              <td>{cat.category_name}</td>
              <td>{cat.category_name_en}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleShowEditModal(cat)}
                  className="me-2"
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cat.category_id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "แก้ไขประเภทสินค้า" : "เพิ่มประเภทสินค้าใหม่"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อประเภท (ไทย)</Form.Label>
              <Form.Control
                type="text"
                value={currentCategory.category_name}
                onChange={(e) =>
                  setCurrentCategory({
                    ...currentCategory,
                    category_name: e.target.value,
                  })
                }
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อประเภท (English)</Form.Label>
              <Form.Control
                type="text"
                value={currentCategory.category_name_en || ""}
                onChange={(e) =>
                  setCurrentCategory({
                    ...currentCategory,
                    category_name_en: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* --- START: จุดที่แก้ไข --- */}
            {/* 6. เพิ่มช่องสำหรับอัปโหลดไอคอน */}
            <Form.Group className="mb-3">
              <Form.Label>ไอคอน</Form.Label>
              {isEditMode && currentCategory.icon_url && (
                <div className="mb-2">
                  <p className="mb-1 small text-muted">ไอคอนปัจจุบัน:</p>
                  <Image
                    src={currentCategory.icon_url}
                    thumbnail
                    style={{ maxHeight: "80px" }}
                  />
                </div>
              )}
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              <Form.Text className="text-muted">
                เลือกไฟล์ใหม่เพื่ออัปเดต หรือเว้นว่างไว้เพื่อใช้รูปเดิม
              </Form.Text>
            </Form.Group>
            {/* --- END: จุดที่แก้ไข --- */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              <FaSave /> บันทึก
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
