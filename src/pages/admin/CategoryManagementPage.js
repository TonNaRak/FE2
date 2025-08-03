import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. อัปเดต State ให้มี category_name_en
  const [currentCategory, setCurrentCategory] = useState({
    category_id: null,
    category_name: "",
    category_name_en: "",
  });

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/categories", API_CONFIG);
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
    // 2. อัปเดต State เริ่มต้นสำหรับเพิ่มข้อมูลใหม่
    setCurrentCategory({
      category_id: null,
      category_name: "",
      category_name_en: "",
    });
    setShowModal(true);
  };

  const handleShowEditModal = (category) => {
    setIsEditMode(true);
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    // 3. เตรียมข้อมูลที่จะส่งให้มีทั้งสองภาษา
    const dataToSave = {
      category_name: currentCategory.category_name,
      category_name_en: currentCategory.category_name_en,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${currentCategory.category_id}`,
          dataToSave,
          API_CONFIG
        );
      } else {
        await axios.post("https://api.souvenir-from-lagoon-thailand.com/api/admin/categories", dataToSave, API_CONFIG);
      }
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      alert(
        `เกิดข้อผิดพลาด: ${err.response?.data?.message || "โปรดลองอีกครั้ง"}`
      );
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสินค้านี้?")) {
      try {
        await axios.delete(`https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${categoryId}`, API_CONFIG);
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
            <th>ชื่อประเภท (ไทย)</th>
            <th>ชื่อประเภท (English)</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.category_id}>
              <td>{cat.category_id}</td>
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
            {/* 4. เพิ่มช่องกรอกสำหรับภาษาอังกฤษ */}
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
            <Form.Group>
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
