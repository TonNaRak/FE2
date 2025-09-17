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

  // --- START: แก้ไข State ---
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // --- เพิ่ม State ใหม่สำหรับ Modal การชำระเงิน และผลลัพธ์ ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState({
    orderId: null,
    change: 0,
  });
  // --- END: แก้ไข State ---

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

  // --- เพิ่ม useEffect ใหม่สำหรับคำนวณเงินทอนอัตโนมัติ ---
  useEffect(() => {
    const received = parseFloat(cashReceived);
    if (!isNaN(received) && received >= totalPrice) {
      setChange(received - totalPrice);
    } else {
      setChange(0);
    }
  }, [cashReceived, totalPrice]);

  const handleProductSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name_en && p.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = async (product) => {
    if (product.has_options) {
      try {
        const response = await axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/product/${product.product_id}`,
          API_CONFIG
        );
        setModalProduct(response.data);
        const initialOptions = {};
        if (response.data.options && response.data.options.length > 0) {
          response.data.options.forEach((opt) => {
            initialOptions[opt.option_name] = "";
          });
        }
        setSelectedOptions(initialOptions);
        setShowOptionsModal(true);
      } catch (err) {
        alert("ไม่สามารถโหลดข้อมูลตัวเลือกสินค้าได้");
      }
      return;
    }

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

  const handleAddToCartWithOptions = () => {
    for (const option of modalProduct.options) {
      if (!selectedOptions[option.option_name]) {
        alert(`กรุณาเลือก "${option.option_name}"`);
        return;
      }
    }

    const cartId = modalProduct.product_id + JSON.stringify(selectedOptions);
    const existingItem = cart.find((item) => item.cart_id === cartId);

    if (existingItem) {
      updateQuantity(cartId, 1);
    } else {
      const newItem = {
        ...modalProduct,
        quantity: 1,
        cart_id: cartId,
        selected_options: selectedOptions,
      };
      setCart([...cart, newItem]);
    }
    setShowOptionsModal(false);
  };

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

  // --- START: แก้ไขฟังก์ชันชำระเงินทั้งหมด ---

  // 1. ฟังก์ชันนี้จะถูกเรียกเมื่อกดปุ่ม "ชำระเงิน" หลัก
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงในตะกร้าก่อน");
      return;
    }
    setCashReceived(""); // รีเซ็ตค่าเงินที่รับ
    setChange(0); // รีเซ็ตเงินทอน
    setShowPaymentModal(true); // เปิด Modal รับเงิน
  };

  // 2. ฟังก์ชันนี้จะถูกเรียกเมื่อกด "ยืนยันการชำระเงิน" ใน Modal
  const handleSubmitOrder = async () => {
    if (parseFloat(cashReceived) < totalPrice) {
      alert("จำนวนเงินที่รับมาไม่เพียงพอ");
      return;
    }
    if (isNaN(parseFloat(cashReceived))) {
      alert("กรุณากรอกจำนวนเงินที่รับมา");
      return;
    }

    try {
      const orderData = {
        items: cart,
        totalPrice,
        userId: selectedCustomer ? selectedCustomer.user_id : null,
        cashReceived: parseFloat(cashReceived), // ส่งค่าเงินที่รับ
        changeGiven: change, // ส่งค่าเงินทอน
      };

      const response = await axios.post(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/orders/create-in-store",
        orderData,
        API_CONFIG
      );

      setLastOrderInfo({ orderId: response.data.orderId, change: change });
      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // ล้างข้อมูลสำหรับออเดอร์ถัดไป
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างออเดอร์");
    }
  };

  // 3. ฟังก์ชันสำหรับปิด Modal แจ้งเตือนหลังสำเร็จ
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setLastOrderInfo({ orderId: null, change: 0 });
  };
  // --- END: แก้ไขฟังก์ชันชำระเงิน ---

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
                  <div className="d-grid mt-3">
                    {/* --- ปุ่มนี้จะเรียก handleCheckout เพื่อเปิด Modal --- */}
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      ชำระเงิน
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal สำหรับเลือกตัวเลือกสินค้า */}
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

      {/* --- START: เพิ่ม Modal ใหม่ 2 ตัว --- */}
      {/* 1. Modal สำหรับรับเงิน */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รับชำระเงิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3 className="text-center mb-3">
            ยอดรวม: {totalPrice.toLocaleString()} บาท
          </h3>
          <Form.Group>
            <Form.Label>รับเงินมา (บาท)</Form.Label>
            <Form.Control
              type="number"
              placeholder="กรอกจำนวนเงินที่รับ"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmitOrder();
                }
              }}
            />
          </Form.Group>
          <h4 className="text-center mt-4">
            เงินทอน:{" "}
            <span className="text-success">
              {change.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>{" "}
            บาท
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitOrder}
            disabled={
              parseFloat(cashReceived) < totalPrice ||
              isNaN(parseFloat(cashReceived))
            }
          >
            ยืนยันการชำระเงิน
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 2. Modal สำหรับแสดงผลหลังทำรายการสำเร็จ */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-success">ทำรายการสำเร็จ!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h4>ออเดอร์หมายเลข #{lastOrderInfo.orderId}</h4>
          <h1 className="display-4 my-3">
            เงินทอน:{" "}
            <span className="fw-bold">
              {lastOrderInfo.change.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>{" "}
            บาท
          </h1>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccessModal}>
            ปิด และเริ่มรายการใหม่
          </Button>
        </Modal.Footer>
      </Modal>
      {/* --- END: เพิ่ม Modal ใหม่ --- */}
    </>
  );
};

export default POSPage;
