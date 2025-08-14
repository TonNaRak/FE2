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
import "./ProductOptions.css"; 

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const initialProductState = {
    name: "",
    name_en: "",
    price: "",
    description: "",
    description_en: "",
    category_id: "",
    image_url: "",
    recommend_status: 0,
    sales_status: 1,
    options: [],
  };
  const [currentProduct, setCurrentProduct] = useState(initialProductState);

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/products",
        API_CONFIG
      );
      setProducts(response.data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/categories",
        API_CONFIG
      );
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

  // --- START: ฟังก์ชันจัดการตัวเลือกสินค้า (เวอร์ชันสองภาษา) ---
  const handleAddVariation = () => {
    setCurrentProduct((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", name_en: "", values: [] }], // เพิ่ม name_en
    }));
  };

  const handleRemoveVariation = (index) => {
    setCurrentProduct((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleVariationNameChange = (e, index) => {
    const { name, value } = e.target;
    const newOptions = [...currentProduct.options];
    newOptions[index][name] = value; // name สามารถเป็น 'name' หรือ 'name_en'
    setCurrentProduct((prev) => ({ ...prev, options: newOptions }));
  };
  
  const handleOptionValueKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value) {
        const newOptions = [...currentProduct.options];
        if (!newOptions[index].values.some((v) => v.name === value)) {
          // เพิ่มทั้ง name (ไทย) และ name_en (อังกฤษ) ที่เป็นค่าว่าง
          newOptions[index].values.push({ name: value, name_en: "" });
          setCurrentProduct((prev) => ({ ...prev, options: newOptions }));
        }
        e.target.value = "";
      }
    }
  };

  // ฟังก์ชันใหม่สำหรับอัปเดต name_en ของค่าตัวเลือก
  const handleOptionValueEnChange = (e, groupIndex, valueIndex) => {
    const newOptions = [...currentProduct.options];
    newOptions[groupIndex].values[valueIndex].name_en = e.target.value;
    setCurrentProduct(prev => ({ ...prev, options: newOptions }));
  };

  const removeOptionValue = (groupIndex, valueIndex) => {
    const newOptions = [...currentProduct.options];
    newOptions[groupIndex].values.splice(valueIndex, 1);
    setCurrentProduct((prev) => ({ ...prev, options: newOptions }));
  };
  // --- END: ฟังก์ชันจัดการตัวเลือกสินค้า ---

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(currentProduct).forEach((key) => {
      if (
        key !== "options" &&
        key !== "category_name" &&
        key !== "product_id"
      ) {
        formData.append(key, currentProduct[key]);
      }
    });

    const cleanOptions = currentProduct.options
      .filter((opt) => opt.name && opt.values.length > 0)
      .map((opt) => ({
        ...opt,
        values: opt.values.filter((val) => val.name),
      }));

    formData.append("options", JSON.stringify(cleanOptions));

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Form submission error", err.response?.data || err.message);
      alert(
        `เกิดข้อผิดพลาด: ${err.response?.data?.message || "โปรดลองอีกครั้ง"}`
      );
    }
  };

  const openModalForAdd = () => {
    setIsEditMode(false);
    setCurrentProduct(initialProductState);
    setSelectedFile(null);
    setShowModal(true);
  };

  const openModalForEdit = async (product) => {
    try {
      const response = await axios.get(
        `https://api.souvenir-from-lagoon-thailand.com/api/product/${product.product_id}`,
        API_CONFIG
      );
      setIsEditMode(true);

      const productData = response.data;
      if (!productData.options) {
        productData.options = [];
      } else {
        // แปลงโครงสร้างจาก DB ให้ตรงกับ UI (เพิ่ม _en)
        productData.options = productData.options.map((opt) => ({
          name: opt.option_name,
          name_en: opt.option_name_en,
          values: opt.values.map((val) => ({ 
              name: val.value_name,
              name_en: val.value_name_en 
            })),
        }));
      }

      setCurrentProduct(productData);
      setSelectedFile(null);
      setShowModal(true);
    } catch (err) {
      alert("ไม่สามารถโหลดข้อมูลตัวเลือกสินค้าได้");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      try {
        await axios.delete(
          `https://api.souvenir-from-lagoon-thailand.com/api/admin/products/${productId}`,
          API_CONFIG
        );
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
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
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

            <hr />
            <h5>ประเภทตัวเลือกสินค้า (Variations)</h5>
            <p className="text-muted small">
              เพิ่มประเภทตัวเลือก เช่น ขนาด, สี
              จากนั้นใส่ตัวเลือกย่อยโดยการพิมพ์แล้วกด Enter
            </p>

            {currentProduct.options.map((option, index) => (
              <div key={index} className="variation-group">
                <div className="variation-header">
                    <Form.Control
                        type="text"
                        placeholder="ชื่อประเภท (ไทย)"
                        name="name"
                        value={option.name}
                        onChange={(e) => handleVariationNameChange(e, index)}
                        required
                    />
                      <Form.Control
                        type="text"
                        placeholder="ชื่อประเภท (Eng)"
                        name="name_en"
                        className="ms-2"
                        value={option.name_en || ''}
                        onChange={(e) => handleVariationNameChange(e, index)}
                    />
                    <Button variant="link" className="text-danger ms-2" style={{whiteSpace: 'nowrap'}} onClick={() => handleRemoveVariation(index)}>
                        ลบ
                    </Button>
                </div>
                <div className="tags-input-container">
                    {option.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="d-flex align-items-center me-2 mb-1">
                            <div className="tag-item">
                                {value.name}
                                <button type="button" onClick={() => removeOptionValue(index, valueIndex)}>
                                    &times;
                                </button>
                            </div>
                            <Form.Control
                                type="text"
                                placeholder="Eng"
                                className="ms-1"
                                style={{ width: '80px', fontSize: '14px', height: '31px', padding: '4px 8px' }}
                                value={value.name_en || ''}
                                onChange={(e) => handleOptionValueEnChange(e, index, valueIndex)}
                            />
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    className="tags-input mt-2 form-control"
                    placeholder="เพิ่มตัวเลือก (ไทย) แล้วกด Enter"
                    onKeyDown={(e) => handleOptionValueKeyDown(e, index)}
                />
              </div>
            ))}

            <Button
              variant="outline-success"
              size="sm"
              onClick={handleAddVariation}
            >
              + เพิ่มประเภทตัวเลือก
            </Button>
            <hr />

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
    </div>
  );
};

export default ProductManagementPage;