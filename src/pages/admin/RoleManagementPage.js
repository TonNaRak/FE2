import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  InputGroup,
  Col,
  Card,
  Modal,
  Row, // <-- เพิ่ม Row
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaSearch } from "react-icons/fa";
import "./RoleManagementPage.css";

const RoleManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // <-- 1. เพิ่ม State สำหรับ Filter

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "",
    body: "",
    variant: "success",
  });

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  // ดึงข้อมูล Roles แค่ครั้งเดียว
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/roles",
          API_CONFIG
        );
        setRoles(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูล Role ได้");
      }
    };
    fetchRoles();
  }, []);

  // 2. อัปเดต useEffect ให้ทำงานเมื่อ roleFilter เปลี่ยนด้วย
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/users",
          {
            ...API_CONFIG,
            // 3. ส่งค่า q และ roleId ไปกับ request
            params: { q: searchTerm, roleId: roleFilter },
          }
        );

        const usersWithRoleId = response.data.map((user) => {
          const role = roles.find((r) => r.role_name === user.role_name);
          const roleId = role ? role.role_id : 1;
          return { ...user, role_id: roleId, original_role_id: roleId };
        });
        setUsers(usersWithRoleId);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้ หรือคุณไม่มีสิทธิ์เข้าถึง");
      } finally {
        setLoading(false);
      }
    };

    // หน่วงเวลาการ fetch หลังจากผู้ใช้พิมพ์เสร็จ
    const delayDebounceFn = setTimeout(() => {
      if (roles.length > 0) {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roleFilter, roles]); // <-- เพิ่ม roleFilter และ roles ที่นี่

  const handleRoleChange = (userId, newRoleId) => {
    setUsers(
      users.map((user) =>
        user.user_id === userId
          ? { ...user, role_id: parseInt(newRoleId) }
          : user
      )
    );
  };

  const handleSaveRole = async (userId, roleId) => {
    try {
      await axios.put(
        `https://api.souvenir-from-lagoon-thailand.com/api/admin/users/${userId}/role`,
        { roleId },
        API_CONFIG
      );
      setNotificationMessage({
        title: "สำเร็จ",
        body: "อัปเดตสิทธิ์ผู้ใช้งานเรียบร้อยแล้ว",
        variant: "success",
      });
      setShowNotificationModal(true);
      setUsers(
        users.map((u) =>
          u.user_id === userId ? { ...u, original_role_id: roleId } : u
        )
      );
    } catch (err) {
      setNotificationMessage({
        title: "เกิดข้อผิดพลาด",
        body: err.response?.data?.message || "โปรดลองอีกครั้ง",
        variant: "danger",
      });
      setShowNotificationModal(true);
    }
  };

  if (error && !loading) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="role-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">จัดการสิทธิ์ผู้ใช้งาน</h1>
      </div>

      <Card className="settings-card shadow-sm">
        <Card.Body>
          {/* --- START: 4. ปรับ Layout ของช่องค้นหาและ Filter --- */}
          <Row className="mb-4 justify-content-between align-items-center">
            <Col md={5}>
              <Form.Group>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="ค้นหาด้วยชื่อผู้ใช้ หรืออีเมล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {/* --- END: 4. ปรับ Layout --- */}

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table hover responsive className="role-table">
              <thead>
                <tr>
                  <th className="text-center">ID</th>
                  <th className="text-center">Username</th>
                  <th className="text-center">Email</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="text-center">{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <Form.Select
                        value={user.role_id}
                        onChange={(e) =>
                          handleRoleChange(user.user_id, e.target.value)
                        }
                        aria-label={`Role for ${user.username}`}
                      >
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSaveRole(user.user_id, user.role_id)
                        }
                        disabled={user.role_id === user.original_role_id}
                      >
                        บันทึก
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

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
    </Container>
  );
};

export default RoleManagementPage;
