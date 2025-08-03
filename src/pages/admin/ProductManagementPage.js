import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge,
  Image,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    name_en: "",
    price: "",
    description: "",
    description_en: "",
    category_id: "",
    image_url: "",
    recommend_status: 0,
    sales_status: 1,
  });

  const { token } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      console.error("Could not fetch categories", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", currentProduct.name);
    formData.append("name_en", currentProduct.name_en || "");
    formData.append("price", currentProduct.price);
    formData.append("description", currentProduct.description || "");
    formData.append("description_en", currentProduct.description_en || "");
    formData.append("category_id", currentProduct.category_id);
    formData.append("recommend_status", currentProduct.recommend_status);
    formData.append("sales_status", currentProduct.sales_status);

    if (isEditMode) {
      formData.append("existing_image_url", currentProduct.image_url || "");
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const apiEndpoint = isEditMode
      ? `https://api.souvenir-from-lagoon-thailand.com/api/admin/products/${currentProduct.product_id}`
      : "https://api.souvenir-from-lagoon-thailand.com/api/admin/products";
    const apiMethod = isEditMode ? "put" : "post";

    try {
      await axios[apiMethod](apiEndpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Form submission error", err);
      alert(
        `เกิดข้อผิดพลาด: ${err.response?.data?.message || "โปรดลองอีกครั้ง"}`
      );
    }
  };

  const openModalForAdd = () => {
    setIsEditMode(false);
    setCurrentProduct({
      name: "",
      name_en: "",
      price: "",
      description: "",
      description_en: "",
      category_id: "",
      image_url: "",
      recommend_status: 0,
      sales_status: 1,
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openModalForEdit = (product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      try {
        await axios.delete(`https://api.souvenir-from-lagoon-thailand.com/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        console.error("Delete error", err);
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
        <h1>จัดการสินค้า</h1>
        <Button variant="primary" onClick={openModalForAdd}>
          + เพิ่มสินค้าใหม่
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>รูปภาพ</th>
            <th>ชื่อสินค้า</th>
            <th>ราคา</th>
            <th>ประเภท</th>
            <th>สถานะแนะนำ</th>
            <th>สถานะการขาย</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.product_id}</td>
              <td>
                <Image
                  src={product.image_url}
                  thumbnail
                  style={{ maxHeight: "50px" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/50";
                  }}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.price.toLocaleString()}</td>
              <td>{product.category_name}</td>
              <td>
                <Badge bg={product.recommend_status ? "success" : "secondary"}>
                  {product.recommend_status ? "แนะนำ" : "ปกติ"}
                </Badge>
              </td>
              <td>
                <Badge bg={product.sales_status ? "success" : "secondary"}>
                  {product.sales_status ? "วางขาย" : "ซ่อน"}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => openModalForEdit(product)}
                >
                  แก้ไข
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product.product_id)}
                >
                  ลบ
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อสินค้า (ไทย)</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อสินค้า (English)</Form.Label>
                  <Form.Control
                    type="text"
                    name="name_en"
                    value={currentProduct.name_en || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>ราคา</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={currentProduct.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>คำอธิบาย (ไทย)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentProduct.description || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>คำอธิบาย (English)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description_en"
                value={currentProduct.description_en || ""}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ประเภทสินค้า</Form.Label>
              <Form.Select
                name="category_id"
                value={currentProduct.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- เลือกประเภท --</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>รูปภาพสินค้า</Form.Label>
              {isEditMode && currentProduct.image_url && (
                <div className="mb-2">
                  <p className="mb-1 small text-muted">รูปภาพปัจจุบัน:</p>
                  <Image
                    src={currentProduct.image_url}
                    thumbnail
                    style={{ maxHeight: "100px" }}
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
              <Form.Check
                type="switch"
                id="recommend_status"
                name="recommend_status"
                label="สินค้าแนะนำ"
                checked={!!currentProduct.recommend_status}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="sales_status"
                name="sales_status"
                label="วางขายสินค้า"
                checked={!!currentProduct.sales_status}
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                ยกเลิก
              </Button>
              <Button variant="primary" type="submit">
                บันทึก
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;
