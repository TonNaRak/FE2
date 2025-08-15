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

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "",
    body: "",
    variant: "success",
  });

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

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

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            "https://api.souvenir-from-lagoon-thailand.com/api/admin/users",
            {
              ...API_CONFIG,
              params: { q: searchTerm },
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

      if (roles.length > 0) {
        fetchUsers();
      } else if (!loading && roles.length === 0 && !error) {
        fetchUsers();
      } else if (error) {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roles]);

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
    <Container fluid className="role-management-page py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">จัดการสิทธิ์ผู้ใช้งาน</h1>
      </div>

      {/* --- จุดที่แก้ไข: ลบ <p> ออกจากตรงนี้ --- */}

      <Card className="settings-card shadow-sm">
        <Card.Body>
          <Form.Group as={Col} md={6} lg={4} className="mb-4">
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

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            // --- จุดที่แก้ไข: ปรับ props ของ Table ---
            <Table hover responsive className="role-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* --- จุดที่แก้ไข: ปรับการจัดวาง --- */}
                  <th className="text-end">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
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
                    {/* --- จุดที่แก้ไข: ปรับการจัดวาง --- */}
                    <td className="text-end">
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
