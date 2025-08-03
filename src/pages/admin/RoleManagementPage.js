import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  InputGroup,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaSearch } from "react-icons/fa";

const RoleManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { token } = useAuth();
  const API_CONFIG = { headers: { Authorization: `Bearer ${token}` } };

  // ดึงข้อมูล Roles แค่ครั้งเดียวตอนเริ่ม
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/admin/roles", API_CONFIG);
        setRoles(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูล Role ได้");
      }
    };
    fetchRoles();
  }, []);

  // ดึงข้อมูล Users ทุกครั้งที่ searchTerm เปลี่ยน (Debouncing)
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/admin/users", {
            ...API_CONFIG,
            params: { q: searchTerm },
          });

          const usersWithRoleId = response.data.map((user) => {
            const role = roles.find((r) => r.role_name === user.role_name);
            return { ...user, role_id: role ? role.role_id : 1 };
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
        // กรณีที่ roles โหลดเสร็จแล้วแต่เป็น array ว่าง
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
      alert("อัปเดตสิทธิ์สำเร็จ!");
      // ไม่ต้อง fetchUsers() ซ้ำ เพราะ state ถูกเปลี่ยนไปแล้ว และจะแสดงผลถูกต้องใน UI
      // แต่ถ้าต้องการความแน่นอน 100% ว่าข้อมูลตรงกับ DB ก็สามารถเรียก fetchUsers() ได้
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตสิทธิ์");
    }
  };

  if (error && !loading) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h1>จัดการสิทธิ์ผู้ใช้งาน</h1>
      <p className="text-muted">
        เฉพาะเจ้าของร้าน (Admin) เท่านั้นที่สามารถแก้ไขสิทธิ์ได้
      </p>

      <Form.Group as={Col} md="6" lg="4" className="mb-4">
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
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>จัดการ</th>
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
                  >
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => handleSaveRole(user.user_id, user.role_id)}
                  >
                    บันทึก
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default RoleManagementPage;
