import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHistory, FaTrophy, FaArrowUp, FaArrowDown, FaExchangeAlt, FaRedo, FaArrowLeft, FaAward } from 'react-icons/fa'; 
import "./PointHistoryPage.css"; 

// กำหนดรหัสสีใหม่เพื่อความง่ายในการอ่าน
const PRIMARY_COLOR = '#068fc6';
const LIGHT_BLUE_BG = '#e9f5ff'; 

const PointHistoryPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPointHistory = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/user/points-history",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(response.data);
      } catch (err) {
        setError(t("error_fetching_points_history"));
        console.error("Error fetching point history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPointHistory();
  }, [t]);

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const lang = localStorage.getItem("i18nextLng") || "th";

  // ใช้รูปแบบสั้นโดยอิง locale ปัจจุบัน
  return new Intl.DateTimeFormat(lang, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};


  const getTransactionDetails = (pointsChange) => {
    if (pointsChange > 0) {
      return { icon: <FaArrowUp />, type: "earn", color: "text-success" };
    }
    return { icon: <FaArrowDown />, type: "redeem", color: "text-danger" };
  };

  return (
    <div className="profile-page-bg">
      <Container className="profile-container"> 
        
        {/* === ส่วนหัวที่ถูกแก้ไข: มีพื้นหลังสีขาว/เงา + ปุ่มวงกลม + FaHistory === */}
        <div className="p-4 bg-white shadow-sm mb-4 rounded-3"> 
          
          {/* จัดให้ปุ่มย้อนกลับอยู่ซ้าย และหัวข้ออยู่กลาง */}
          <div className="d-flex align-items-center justify-content-center position-relative">
              
              {/* ปุ่มย้อนกลับ: ไอคอนวงกลมสีฟ้า ไม่มีข้อความ "ย้อนกลับ" */}
              <Link 
                  to="/profile" 
                  className="position-absolute start-0 back-button-circle"
                  style={{ zIndex: 10 }} 
              >
                  {/* Div สำหรับสร้างวงกลมสีฟ้าและทำให้ไอคอนเป็นสีขาว */}
                  <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ backgroundColor: PRIMARY_COLOR, width: '40px', height: '40px' }}
                  >
                      <FaArrowLeft className="text-white" style={{ fontSize: '1.2rem' }} /> 
                  </div>
              </Link>
          
              {/* หัวข้อหน้า: ใช้ FaHistory และอยู่ตรงกลาง */}
              <h2 
                  className="mb-0 fs-3" 
                  style={{ color: PRIMARY_COLOR, fontWeight: 700 }} 
              >
                 {/* เปลี่ยนจาก FaRedo เป็น FaHistory */}
                 <FaHistory className="me-2" style={{ color: PRIMARY_COLOR, fontSize: '1.5rem' }} /> ประวัติการใช้แต้ม
              </h2>

          </div>

        </div>
        {/* ==================================================== */}
        
        <Card className="border-0"> 
          
          {/* 3. Card.Header: แถบรายการและคะแนน */}
          <Card.Header 
            as="div"
            className="p-4 bg-white border-bottom" 
          >
            
            {/* จัดแนวนอน: Your Transactions (ซ้าย) และ Current Points (ขวา) */}
            <div className="d-flex justify-content-between align-items-center">
                
                {/* Your Transactions (ซ้าย) */}
                <h5 className="mb-0 text-secondary d-flex align-items-center"> 
                    <FaExchangeAlt className="me-2" /> 
                    แต้มสะสมของคุณ
                </h5>

                {/* Current Points (ขวา) - ปรับขนาดให้เหมาะกับการอยู่ด้านข้าง */}
                <div 
                    className="p-2 px-3 text-center shadow-sm" 
                    style={{
                        backgroundColor: LIGHT_BLUE_BG, 
                        color: PRIMARY_COLOR, 
                        borderRadius: '0.75rem', 
                    }}
                >
                    {/* ไอคอนและตัวเลขให้อยู่ในแถวเดียวกัน */}
                    <span className="d-inline-flex align-items-center">
                        <FaAward style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
                        
                        <span className="fw-bolder fs-6"> 
                            {user?.points.toLocaleString() || 0} แต้ม
                        </span>
                    </span>
                </div>
            </div>
            
          </Card.Header>

          {/* Card.Body ที่แสดงรายการประวัติ (เลื่อนได้) */}
          <Card.Body className="p-0"> 
            {loading && (
              <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-primary">กำลังโหลดประวัติ...</p>
              </div>
            )}
            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
            
            {!loading && !error && (
              <ListGroup variant="flush">
                {history.length > 0 ? (
                  history.map((item) => {
                    const { icon, type, color } = getTransactionDetails(item.points_change);
                    
                    const description = item.description || 
                      (type === "earn"
                        ? t("points_earned_default") || "ได้รับคะแนนจากกิจกรรม"
                        : t("points_redeemed_default") || "แลกของรางวัล");
                    const shortDescription = description.length > 50 
                      ? description.substring(0, 47) + '...' 
                      : description;

                    return (
                      <ListGroup.Item
                        key={item.history_id}
                        className={`d-flex justify-content-between align-items-center p-3 point-history-item point-history-list-item ${color}`} 
                      >
                        <div className="d-flex align-items-center">
                          <div className={`p-2 rounded-circle me-3 text-white ${type === 'earn' ? 'bg-success' : 'bg-danger'}`}>
                            {icon}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <strong className="fs-6">
                              {item.points_change > 0 ? t("points_earned") : t("points_redeemed")}
                            </strong >
                            <p className="mb-0 text-muted small">{shortDescription}</p>
                          </div>
                        </div>

                        <div className="text-end" style={{ minWidth: '120px' }}>
                            <Badge
                                bg="transparent"
                                className={`p-0 fw-bold fs-5 ${color}`}
                            >
                                {item.points_change > 0
                                ? `+${item.points_change.toLocaleString()}`
                                : item.points_change.toLocaleString()}
                            </Badge>
                            <br/>
                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {formatDateTime(item.transaction_date)}
                            </small>
                        </div>
                      </ListGroup.Item>
                    );
                  })
                ) : (
                  <p className="text-center text-muted mt-3 p-5">
                    <FaRedo className="me-2" /> {t("no_points_history")}
                  </p>
                )}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PointHistoryPage;