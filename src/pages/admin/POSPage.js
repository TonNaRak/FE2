// src/pages/admin/POSPage.js
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

  // --- START: Modals & Payment State ---
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // ใหม่: modal เลือกช่องทางชำระ
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState("cash"); // 'cash' | 'transfer'

  // เดิม: modal รับเงินสด
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState({
    orderId: null,
    change: 0,
  });
  // --- END ---

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };
  const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/products`, API_CONFIG);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAllProducts();
  }, [token]);

  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cart]);

  // คำนวณเงินทอนอัตโนมัติสำหรับเงินสด
  useEffect(() => {
    const received = parseFloat(cashReceived);
    if (!isNaN(received) && received >= totalPrice) {
      setChange(received - totalPrice);
    } else {
      setChange(0);
    }
  }, [cashReceived, totalPrice]);

  const handleProductSearch = (e) => setSearchTerm(e.target.value);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.name_en && p.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStockForItem = (itemLike) => Number(itemLike?.stock_qty ?? 0);

  const canIncrease = (item, incBy = 1) => {
    const stock = getStockForItem(item);
    const nextQty = (item?.quantity ?? 0) + incBy;
    return nextQty <= stock;
  };

  const addToCart = async (product) => {
    if (getStockForItem(product) <= 0) {
      alert("สินค้านี้หมดสต็อกแล้ว");
      return;
    }

    if (product.has_options) {
      try {
        const response = await axios.get(
          `${API_BASE}/api/product/${product.product_id}`,
          API_CONFIG
        );
        const data = response.data || {};
        data.stock_qty =
          typeof data.stock_qty === "number"
            ? data.stock_qty
            : product.stock_qty;

        setModalProduct(data);
        const initialOptions = {};
        if (data.options && data.options.length > 0) {
          data.options.forEach((opt) => (initialOptions[opt.option_name] = ""));
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
      if (!canIncrease(existingItem, 1)) {
        alert(
          `สต็อกคงเหลือ ${getStockForItem(existingItem)} ชิ้น ไม่สามารถเพิ่มได้`
        );
        return;
      }
      updateQuantity(cartId, 1);
    } else {
      if (getStockForItem(product) < 1) {
        alert("สินค้านี้หมดสต็อกแล้ว");
        return;
      }
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

    if (getStockForItem(modalProduct) <= 0) {
      alert("สินค้านี้หมดสต็อกแล้ว");
      return;
    }

    const cartId = modalProduct.product_id + JSON.stringify(selectedOptions);
    const existingItem = cart.find((item) => item.cart_id === cartId);

    if (existingItem) {
      if (!canIncrease(existingItem, 1)) {
        alert(
          `สต็อกคงเหลือ ${getStockForItem(existingItem)} ชิ้น ไม่สามารถเพิ่มได้`
        );
        return;
      }
      updateQuantity(cartId, 1);
    } else {
      const newItem = {
        ...modalProduct,
        quantity: 1,
        cart_id: cartId,
        selected_options: selectedOptions,
      };
      newItem.stock_qty = getStockForItem(modalProduct);
      setCart([...cart, newItem]);
    }
    setShowOptionsModal(false);
  };

  const updateQuantity = (cartId, amount) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cart_id !== cartId) return item;

        if (amount < 0) {
          const nextQty = Math.max(1, item.quantity + amount);
          return { ...item, quantity: nextQty };
        }

        const stock = getStockForItem(item);
        const nextQty = item.quantity + amount;
        if (nextQty > stock) {
          alert(`สต็อกคงเหลือ ${stock} ชิ้น ไม่สามารถเพิ่มได้`);
          return item;
        }
        return { ...item, quantity: nextQty };
      })
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
          `${API_BASE}/api/admin/users/search?q=${encodeURIComponent(query)}`,
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
    // (ทางเลือก) จะให้เด้งเลือกช่องทางตรงนี้เลยก็ได้ แต่เพื่อ UX ที่คุ้นเคย
    // เราจะเด้งตอนกดปุ่ม "ชำระเงิน" แทน
  };

  const clearCustomer = () => setSelectedCustomer(null);

  // ===== ชำระเงิน =====

  // กดปุ่ม "ชำระเงิน" → เปิด "เลือกช่องทางชำระ"
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("กรุณาเพิ่มสินค้าลงในตะกร้าก่อน");
      return;
    }
    const overItems = cart.filter((it) => it.quantity > getStockForItem(it));
    if (overItems.length > 0) {
      const names = overItems
        .map((it) => `${it.name} (คงเหลือ ${getStockForItem(it)})`)
        .join(", ");
      alert(`บางรายการเกินจำนวนคงเหลือ: ${names}`);
      return;
    }
    // เปิด modal เลือกช่องทาง
    setPaymentChannel("cash"); // default เป็นเงินสด
    setShowChannelModal(true);
  };

  // กดยืนยันช่องทางใน modal
  const handleConfirmChannel = () => {
    if (paymentChannel === "cash") {
      setCashReceived("");
      setChange(0);
      setShowChannelModal(false);
      setShowPaymentModal(true); // ไปหน้าใส่เงินรับ/ทอน
    } else {
      // โอน → ส่งออเดอร์ได้เลย (ไม่ต้องกรอกเงินสด)
      setShowChannelModal(false);
      handleSubmitOrder("transfer");
    }
  };

  // ส่งคำสั่งซื้อจริง
  const handleSubmitOrder = async (channelParam) => {
    const channel = channelParam || paymentChannel;

    if (channel === "cash") {
      if (isNaN(parseFloat(cashReceived))) {
        alert("กรุณากรอกจำนวนเงินที่รับมา");
        return;
      }
      if (parseFloat(cashReceived) < totalPrice) {
        alert("จำนวนเงินที่รับมาไม่เพียงพอ");
        return;
      }
    }

    // กันพลาดอีกรอบก่อนส่ง
    const overItems = cart.filter((it) => it.quantity > getStockForItem(it));
    if (overItems.length > 0) {
      const names = overItems
        .map((it) => `${it.name} (คงเหลือ ${getStockForItem(it)})`)
        .join(", ");
      alert(`บางรายการเกินจำนวนคงเหลือ: ${names}`);
      return;
    }

    try {
      const orderData = {
        items: cart,
        totalPrice,
        userId: selectedCustomer ? selectedCustomer.user_id : null,
        paymentChannel: channel, // << สำคัญ: ส่ง 'cash' หรือ 'transfer'
        cashReceived: channel === "cash" ? parseFloat(cashReceived) : undefined,
        changeGiven: channel === "cash" ? change : undefined,
      };

      const response = await axios.post(
        `${API_BASE}/api/admin/orders/create-in-store`,
        orderData,
        API_CONFIG
      );

      // อัปเดตสต็อกแบบเร็ว
      const qtyByProduct = new Map();
      for (const it of cart) {
        const pid = Number(it.product_id);
        qtyByProduct.set(
          pid,
          (qtyByProduct.get(pid) || 0) + Number(it.quantity || 0)
        );
      }
      setProducts((prev) =>
        prev.map((p) => {
          const minus = qtyByProduct.get(p.product_id) || 0;
          if (!minus) return p;
          const newStock = Math.max(0, (Number(p.stock_qty) || 0) - minus);
          return {
            ...p,
            stock_qty: newStock,
            sales_status: newStock <= 0 ? 0 : p.sales_status,
          };
        })
      );

      await fetchAllProducts();

      setLastOrderInfo({
        orderId: response.data.orderId,
        change: channel === "cash" ? change : 0,
      });

      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // Reset สำหรับรอบถัดไป
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setPaymentChannel("cash");
      setCashReceived("");
      setChange(0);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างออเดอร์");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setLastOrderInfo({ orderId: null, change: 0 });
  };

  const hasOverStock = cart.some((it) => it.quantity > getStockForItem(it));

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
                    {typeof product.stock_qty === "number" && (
                      <small
                        className={
                          product.stock_qty <= 0 ? "text-danger" : "text-muted"
                        }
                      >
                        คงเหลือ: {product.stock_qty} ชิ้น
                      </small>
                    )}
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

                {hasOverStock && (
                  <Alert variant="warning" className="py-2">
                    บางรายการเกินจำนวนคงเหลือในสต็อก
                    โปรดลดจำนวนให้ไม่เกินคงเหลือก่อนชำระเงิน
                  </Alert>
                )}

                <ListGroup
                  variant="flush"
                  className="flex-grow-1 cart-items-list"
                >
                  {cart.map((item) => {
                    const stock = getStockForItem(item);
                    const atMax = item.quantity >= stock && stock > 0;
                    return (
                      <ListGroup.Item
                        key={item.cart_id}
                        className="d-flex align-items-center"
                      >
                        <Image
                          src={
                            item.image_url || "https://via.placeholder.com/50"
                          }
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
                          {typeof stock === "number" && (
                            <small
                              className={
                                stock <= 0 ? "text-danger" : "text-muted"
                              }
                            >
                              คงเหลือ: {stock} ชิ้น
                            </small>
                          )}
                        </div>
                        <div className="d-flex align-items-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => updateQuantity(item.cart_id, -1)}
                            disabled={item.quantity <= 1}
                            title={
                              item.quantity <= 1 ? "ลดไม่ได้ ต่ำสุดคือ 1" : ""
                            }
                          >
                            <BsDash />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => updateQuantity(item.cart_id, 1)}
                            disabled={stock <= 0 || atMax}
                            title={
                              stock <= 0
                                ? "สินค้าหมดสต็อก"
                                : atMax
                                ? `เพิ่มไม่ได้ เกินคงเหลือ (${stock})`
                                : ""
                            }
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
                    );
                  })}
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
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || hasOverStock}
                      title={hasOverStock ? "มีรายการเกินคงเหลือในสต็อก" : ""}
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

      {/* Modal: เลือกตัวเลือกสินค้า */}
      <Modal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>เลือกตัวเลือกสำหรับ: {modalProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalProduct?.options?.map((option) => (
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
          {typeof modalProduct?.stock_qty === "number" && (
            <small
              className={
                modalProduct.stock_qty <= 0 ? "text-danger" : "text-muted"
              }
            >
              คงเหลือ: {modalProduct.stock_qty} ชิ้น
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOptionsModal(false)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToCartWithOptions}
            disabled={(modalProduct?.stock_qty ?? 0) <= 0}
            title={(modalProduct?.stock_qty ?? 0) <= 0 ? "สินค้าหมดสต็อก" : ""}
          >
            เพิ่มลงรายการ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: เลือกช่องทางชำระ (ใหม่) */}
      <Modal
        show={showChannelModal}
        onHide={() => setShowChannelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>เลือกช่องทางการชำระเงิน</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="pay-cash"
                name="pos-pay"
                label="เงินสด"
                checked={paymentChannel === "cash"}
                onChange={() => setPaymentChannel("cash")}
              />
              <Form.Check
                type="radio"
                id="pay-transfer"
                name="pos-pay"
                label="โอน/บัตร/QR"
                checked={paymentChannel === "transfer"}
                onChange={() => setPaymentChannel("transfer")}
              />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChannelModal(false)}
          >
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleConfirmChannel}>
            ดำเนินการต่อ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: รับเงินสด */}
      <Modal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รับชำระเงิน (เงินสด)</Modal.Title>
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
                if (e.key === "Enter") handleSubmitOrder("cash");
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
            onClick={() => handleSubmitOrder("cash")}
            disabled={
              parseFloat(cashReceived) < totalPrice ||
              isNaN(parseFloat(cashReceived))
            }
          >
            ยืนยันการชำระเงิน
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: สำเร็จ */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-success">ทำรายการสำเร็จ!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h4>ออเดอร์หมายเลข #{lastOrderInfo.orderId}</h4>

          {lastOrderInfo.paymentChannel === "cash" &&
          lastOrderInfo.change > 0 ? (
            <h1 className="display-6 my-3">
              เงินทอน:{" "}
              <span className="fw-bold">
                {lastOrderInfo.change.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>{" "}
              บาท
            </h1>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccessModal}>
            ปิด และเริ่มรายการใหม่
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default POSPage;
