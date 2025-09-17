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
import "./ProfilePage.css"; // --- ใช้ CSS เดียวกับหน้าโปรไฟล์ได้ ---

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

  return (
    <div className="profile-page-bg">
      <Container className="profile-container">
        <h2 className="text-center mb-4">{t("points_history")}</h2>
        <Card className="shadow-sm">
          <Card.Header
            as="h5"
            className="d-flex justify-content-between align-items-center"
          >
            <span>{t("your_transactions")}</span>
            <span className="fw-bold">
              {t("current_points")}: {user?.points.toLocaleString() || 0}
            </span>
          </Card.Header>
          <Card.Body>
            {loading && (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
              <ListGroup variant="flush">
                {history.length > 0 ? (
                  history.map((item) => (
                    <ListGroup.Item
                      key={item.history_id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {item.description ||
                          (item.transaction_type === "earn"
                            ? t("points_earned")
                            : t("points_redeemed"))}
                        <br />
                        <small className="text-muted">
                          {new Date(item.transaction_date).toLocaleDateString(
                            "th-TH", // --- [ปรับปรุง] แสดงผลภาษาไทยสวยงาม ---
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </small>
                      </div>
                      <Badge
                        bg={item.points_change > 0 ? "success" : "danger"}
                        pill
                        style={{ fontSize: "1rem" }}
                      >
                        {item.points_change > 0
                          ? `+${item.points_change.toLocaleString()}`
                          : item.points_change.toLocaleString()}
                      </Badge>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-center text-muted mt-3">
                    {t("no_points_history")}
                  </p>
                )}
              </ListGroup>
            )}
          </Card.Body>
          <Card.Footer className="text-center">
            <Link to="/profile">{t("back_to_profile")}</Link>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default PointHistoryPage;
