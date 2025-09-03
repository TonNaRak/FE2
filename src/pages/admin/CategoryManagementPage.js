import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Image,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { BsUpload, BsPencilFill, BsTrashFill } from "react-icons/bs";
import "./CategoryManagementPage.css";
import placeholderImage from "../../images/placeholder.png";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    category_name: "",
    category_name_en: "",
    icon_url: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "",
    body: "",
    variant: "success",
  });

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/categories",
        API_CONFIG
      );
      setCategories(response.data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลประเภทสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModalForAdd = () => {
    setIsEditMode(false);
    setCurrentCategory({
      category_name: "",
      category_name_en: "",
      icon_url: "",
    });
    setSelectedFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openModalForEdit = (category) => {
    setIsEditMode(true);
    setCurrentCategory(category);
    setSelectedFile(null);
    setImagePreview(category.icon_url);
    setShowModal(true);
  };

  const handleShowConfirmDelete = (categoryId) => {
    setCategoryToDelete(categoryId); // เก็บ ID ของ category ที่จะลบ
    setShowConfirmDeleteModal(true); // เปิด Modal
  };

  const handleCloseConfirmDelete = () => {
    setCategoryToDelete(null);
    setShowConfirmDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return; // ถ้าไม่มี category ที่จะลบ ก็ไม่ต้องทำอะไร

    try {
      await axios.delete(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${categoryToDelete}`,
        API_CONFIG
      );
      fetchCategories();
      setNotificationMessage({
        title: "สำเร็จ",
        body: "ลบประเภทสินค้าเรียบร้อยแล้ว",
        variant: "success",
      });
      setShowNotificationModal(true);
    } catch (err) {
      setNotificationMessage({
        title: "เกิดข้อผิดพลาด",
        body: err.response?.data?.message || "โปรดลองอีกครั้ง",
        variant: "danger",
      });
      setShowNotificationModal(true);
    } finally {
      handleCloseConfirmDelete();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category_name", currentCategory.category_name);
    formData.append("category_name_en", currentCategory.category_name_en);

    if (selectedFile) {
      formData.append("icon", selectedFile);
    }
    if (isEditMode) {
      formData.append("existing_icon_url", currentCategory.icon_url || "");
    }

    const apiEndpoint = isEditMode
      ? `https://api.souvenir-from-lagoon-thailand.com/api/admin/categories/${currentCategory.category_id}`
      : "https://api.souvenir-from-lagoon-thailand.com/api/admin/categories";
    const apiMethod = isEditMode ? "put" : "post";

    try {
      await axios[apiMethod](apiEndpoint, formData, API_CONFIG);
      setShowModal(false);
      fetchCategories();
      const successMessage = isEditMode
        ? "แก้ไขประเภทสินค้าสำเร็จ!"
        : "เพิ่มประเภทสินค้าใหม่สำเร็จ!";
      setNotificationMessage({
        title: "สำเร็จ",
        body: successMessage,
        variant: "success",
      });
      setShowNotificationModal(true);
    } catch (err) {
      setNotificationMessage({
        title: "เกิดข้อผิดพลาด",
        body: err.response?.data?.message || "โปรดลองอีกครั้ง",
        variant: "danger",
      });
      setShowNotificationModal(true);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="category-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">จัดการประเภทสินค้า</h1>
        <Button variant="primary" onClick={openModalForAdd}>
          + เพิ่มประเภทใหม่
        </Button>
      </div>
      <Card className="settings-card shadow-sm">
        <Card.Body>
          <Table hover responsive className="category-table">
            <thead>
              <tr>
                <th className="text-center">ID</th>
                <th className="text-center">ไอคอน</th>
                <th className="text-center">ชื่อประเภท (ไทย)</th>
                <th className="text-center">ชื่อประเภท (Eng)</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.category_id}>
                  <td>{cat.category_id}</td>
                  <td className="text-center">
                    <Image
                      src={cat.icon_url || placeholderImage}
                      rounded
                      className="category-icon-preview"
                    />
                  </td>
                  <td>{cat.category_name}</td>
                  <td>{cat.category_name_en}</td>
                  <td className="text-center">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => openModalForEdit(cat)}
                      className="me-2 text-white"
                      title="แก้ไข"
                    >
                      <BsPencilFill />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleShowConfirmDelete(cat.category_id)}
                      title="ลบ"
                    >
                      <BsTrashFill />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "แก้ไขประเภทสินค้า" : "เพิ่มประเภทสินค้าใหม่"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3 text-center">
              <Form.Label>ไอคอน</Form.Label>
              <div className="icon-upload-wrapper mx-auto">
                <Image
                  src={imagePreview || placeholderImage}
                  roundedCircle
                  className="icon-image-preview"
                />
                <label htmlFor="icon-upload" className="icon-upload-overlay">
                  <BsUpload size={24} />
                  <span>เปลี่ยนไอคอน</span>
                </label>
                <Form.Control
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อประเภท (ไทย)</Form.Label>
              <Form.Control
                type="text"
                name="category_name"
                value={currentCategory.category_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อประเภท (English)</Form.Label>
              <Form.Control
                type="text"
                name="category_name_en"
                value={currentCategory.category_name_en || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit">
              บันทึก
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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

      <Modal
        show={showConfirmDeleteModal}
        onHide={handleCloseConfirmDelete}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">ยืนยันการลบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสินค้านี้?
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmDelete}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            ยืนยันการลบ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManagementPage;
