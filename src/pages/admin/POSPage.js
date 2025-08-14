import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  ListGroup,
  Image,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  BsSearch,
  BsXCircleFill,
  BsPlus,
  BsDash,
  BsPersonPlus,
  BsTrash,
} from "react-icons/bs";
import "./POSPage.css";

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- START: เพิ่ม State สำหรับ Modal ตัวเลือกสินค้า ---
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  // --- END: เพิ่ม State ---

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/products",
          API_CONFIG
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cart]);

  const handleProductSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name_en && p.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- START: แก้ไขฟังก์ชัน addToCart ให้รองรับสินค้ามีตัวเลือก ---
  const addToCart = async (product) => {
    // ถ้าสินค้ามีตัวเลือก ให้เปิด Modal
    if (product.has_options) {
      try {
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/product/${product.product_id}`,
          API_CONFIG
        );
        setModalProduct(response.data); // เก็บข้อมูลสินค้าทั้งหมด (รวม options)

        // ตั้งค่า selectedOptions เริ่มต้น
        const initialOptions = {};
        if (response.data.options && response.data.options.length > 0) {
          response.data.options.forEach((opt) => {
            initialOptions[opt.option_name] = "";
          });
        }
        setSelectedOptions(initialOptions);
        setShowOptionsModal(true); // เปิด Modal
      } catch (err) {
        alert("ไม่สามารถโหลดข้อมูลตัวเลือกสินค้าได้");
      }
      return;
    }

    // ถ้าสินค้าไม่มีตัวเลือก (ทำงานเหมือนเดิม แต่ใช้ cart_id)
    const cartId = product.product_id.toString();
    const existingItem = cart.find((item) => item.cart_id === cartId);

    if (existingItem) {
      updateQuantity(cartId, 1);
    } else {
      setCart([
        ...cart,
        { ...product, quantity: 1, cart_id: cartId, selected_options: null },
      ]);
    }
  };

  // ฟังก์ชันใหม่สำหรับเพิ่มสินค้ามีตัวเลือกจาก Modal
  const handleAddToCartWithOptions = () => {
    // 1. ตรวจสอบว่าเลือกครบทุกตัวเลือกหรือยัง
    for (const option of modalProduct.options) {
      if (!selectedOptions[option.option_name]) {
        alert(`กรุณาเลือก "${option.option_name}"`);
        return;
      }
    }

    // 2. สร้าง ID ที่ไม่ซ้ำกันสำหรับสินค้าและตัวเลือกชุดนี้
    const cartId = modalProduct.product_id + JSON.stringify(selectedOptions);

    // 3. เช็คว่ามีสินค้า + ตัวเลือกชุดนี้ในตะกร้าแล้วหรือยัง
    const existingItem = cart.find((item) => item.cart_id === cartId);

    if (existingItem) {
      updateQuantity(cartId, 1);
    } else {
      const newItem = {
        ...modalProduct,
        quantity: 1,
        cart_id: cartId, // ใช้ ID ที่สร้างขึ้นใหม่
        selected_options: selectedOptions, // เก็บตัวเลือกที่เลือก
      };
      setCart([...cart, newItem]);
    }

    setShowOptionsModal(false); // ปิด Modal
  };
  // --- END: แก้ไขฟังก์ชัน ---

  const updateQuantity = (cartId, amount) => {
    setCart(
      cart.map((item) =>
        item.cart_id === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cart_id !== cartId));
  };

  const handleCustomerSearch = async (e) => {
    const query = e.target.value;
    setCustomerSearch(query);
    if (query.length > 1) {
      try {
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/admin/users/search?q=${query}`,
          API_CONFIG
        );
        setCustomerResults(response.data);
      } catch (error) {
        console.error("Error searching customers:", error);
      }
    } else {
      setCustomerResults([]);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setCustomerResults([]);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงในตะกร้าก่อน");
      return;
    }

    const orderData = {
      items: cart,
      totalPrice: totalPrice,
      userId: selectedCustomer ? selectedCustomer.user_id : null,
    };

    try {
      const response = await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/create-in-store",
        orderData,
        API_CONFIG
      );
      setMessage({ type: "success", text: response.data.message });
      setCart([]);
      setSelectedCustomer(null);
    } catch (error) {
      setMessage({
        type: "danger",
        text:
          error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างออเดอร์",
      });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  return (
    <>
      <Container fluid className="pos-page">
        <Row>
          <Col md={7} className="product-grid-col">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={handleProductSearch}
              />
            </InputGroup>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="product-card-pos"
                  onClick={() => addToCart(product)}
                >
                  <Card.Img
                    variant="top"
                    src={product.image_url || "https://via.placeholder.com/150"}
                  />
                  <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>{product.price.toLocaleString()} บาท</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          <Col md={5} className="cart-col">
            <Card className="h-100">
              <Card.Header as="h5">รายการสั่งซื้อ</Card.Header>
              <Card.Body className="d-flex flex-column">
                <div className="customer-section mb-3">
                  {selectedCustomer ? (
                    <Alert
                      variant="info"
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>ลูกค้า:</strong> {selectedCustomer.username}
                        <br />
                        <small>แต้มสะสม: {selectedCustomer.points}</small>
                      </div>
                      <Button
                        variant="link"
                        onClick={clearCustomer}
                        className="p-0 text-danger"
                      >
                        <BsXCircleFill />
                      </Button>
                    </Alert>
                  ) : (
                    <div className="position-relative">
                      <InputGroup>
                        <InputGroup.Text>
                          <BsPersonPlus />
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="ค้นหาลูกค้า (ชื่อ, อีเมล, เบอร์โทร)"
                          value={customerSearch}
                          onChange={handleCustomerSearch}
                        />
                      </InputGroup>
                      {customerResults.length > 0 && (
                        <ListGroup className="customer-results">
                          {customerResults.map((cust) => (
                            <ListGroup.Item
                              action
                              key={cust.user_id}
                              onClick={() => selectCustomer(cust)}
                            >
                              {cust.username} ({cust.email || cust.phone})
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                </div>

                <ListGroup
                  variant="flush"
                  className="flex-grow-1 cart-items-list"
                >
                  {cart.map((item) => (
                    <ListGroup.Item
                      key={item.cart_id}
                      className="d-flex align-items-center"
                    >
                      <Image
                        src={item.image_url || "https://via.placeholder.com/50"}
                        thumbnail
                        className="me-3"
                        style={{ width: "50px" }}
                      />
                      <div className="flex-grow-1">
                        <div>{item.name}</div>
                        {item.selected_options && (
                          <small className="text-muted d-block">
                            {Object.values(item.selected_options).join(", ")}
                          </small>
                        )}
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.cart_id, -1)}
                        >
                          <BsDash />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.cart_id, 1)}
                        >
                          <BsPlus />
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        className="text-danger ms-2"
                        onClick={() => removeFromCart(item.cart_id)}
                      >
                        <BsTrash />
                      </Button>
                    </ListGroup.Item>
                  ))}
                  {cart.length === 0 && (
                    <p className="text-center text-muted">
                      ยังไม่มีสินค้าในรายการ
                    </p>
                  )}
                </ListGroup>

                <div className="mt-auto">
                  <hr />
                  <div className="d-flex justify-content-between fs-4 fw-bold">
                    <span>ยอดรวม:</span>
                    <span>{totalPrice.toLocaleString()} บาท</span>
                  </div>
                  {message.text && (
                    <Alert variant={message.type} className="mt-3">
                      {message.text}
                    </Alert>
                  )}
                  <div className="d-grid mt-3">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      ชำระเงิน (หน้าร้าน)
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* --- START: เพิ่ม Modal สำหรับเลือกตัวเลือกสินค้า --- */}
      <Modal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>เลือกตัวเลือกสำหรับ: {modalProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalProduct?.options.map((option) => (
            <div key={option.option_id} className="mb-3">
              <Form.Label className="fw-bold">{option.option_name}:</Form.Label>
              <div className="option-tiles-container-pos">
                {option.values.map((val) => (
                  <Button
                    key={val.value_id}
                    variant={
                      selectedOptions[option.option_name] === val.value_name
                        ? "primary"
                        : "outline-secondary"
                    }
                    className="option-tile-pos"
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [option.option_name]: val.value_name,
                      }))
                    }
                  >
                    {val.value_name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOptionsModal(false)}
          >
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleAddToCartWithOptions}>
            เพิ่มลงรายการ
          </Button>
        </Modal.Footer>
      </Modal>
      {/* --- END: เพิ่ม Modal --- */}
    </>
  );
};

export default POSPage;
