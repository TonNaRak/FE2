import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, Table, Spinner } from "react-bootstrap";
import { ArrowUp, ArrowDown } from "react-bootstrap-icons";
import { format } from "date-fns";

const useSortableData = (
  items,
  config = { key: "totalSpent", direction: "desc" }
) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const isNumeric = ["points", "orderCount", "totalSpent"].includes(
          sortConfig.key
        );

        if (isNumeric) {
          const numA = parseFloat(aValue) || 0;
          const numB = parseFloat(bValue) || 0;
          if (numA < numB) return sortConfig.direction === "asc" ? -1 : 1;
          if (numA > numB) return sortConfig.direction === "asc" ? 1 : -1;
        } else {
          const strA = String(aValue || "").toLowerCase();
          const strB = String(bValue || "").toLowerCase();
          if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
          if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const CustomerDataTable = ({ dateRange }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomersData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
          params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        }
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/all-customers-data",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: params,
          }
        );
        setCustomers(response.data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomersData();
  }, [dateRange]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
  );

  const {
    items: sortedCustomers,
    requestSort,
    sortConfig,
  } = useSortableData(filteredCustomers);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowUp /> : <ArrowDown />;
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tbody>
          <tr>
            {/* แก้ไข colSpan จาก 6 เป็น 4 */}
            <td colSpan="4" className="text-center p-5">
              <Spinner animation="border" />
            </td>
          </tr>
        </tbody>
      );
    }
    if (error) {
      return (
        <tbody>
          <tr>
            {/* แก้ไข colSpan จาก 6 เป็น 4 */}
            <td colSpan="4" className="text-danger text-center p-5">
              {error}
            </td>
          </tr>
        </tbody>
      );
    }
    if (sortedCustomers.length === 0) {
      return (
        <tbody>
          <tr>
            {/* แก้ไข colSpan จาก 6 เป็น 4 */}
            <td colSpan="4" className="text-muted text-center p-5">
              {customers.length > 0
                ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                : "ไม่มีข้อมูลลูกค้า"}
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        {sortedCustomers.map((customer) => (
          <tr key={customer.user_id}>
            <td>{customer.username}</td>
            {/* ซ่อนคอลัมน์ Email และ Phone */}
            {/* <td>{customer.email}</td> */}
            {/* <td>{customer.phone || "-"}</td> */}
            <td className="text-end">
              {parseInt(customer.points).toLocaleString("th-TH")}
            </td>
            <td className="text-end">
              {parseInt(customer.orderCount).toLocaleString("th-TH")}
            </td>
            <td className="text-end">
              {parseFloat(customer.totalSpent).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <Card style={{height: "360px"}}>
      <Card.Body className="d-flex flex-column p-0">
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">รายชื่อลูกค้าทั้งหมด</h5>
            <input
              type="search"
              className="form-control"
              placeholder="ค้นหาลูกค้า..."
              style={{ width: "250px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowY: "auto", height: "260px" }}>
          <Table responsive hover className="mb-0">
            <thead
              className="table-light"
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th
                  onClick={() => requestSort("username")}
                  style={{ cursor: "pointer" }}
                >
                  ชื่อผู้ใช้ {renderSortIcon("username")}
                </th>
                {/* ซ่อน Header ของ Email และ Phone */}
                {/* <th
                  onClick={() => requestSort("email")}
                  style={{ cursor: "pointer" }}
                >
                  อีเมล {renderSortIcon("email")}
                </th>
                <th
                  onClick={() => requestSort("phone")}
                  style={{ cursor: "pointer" }}
                >
                  เบอร์โทรศัพท์ {renderSortIcon("phone")}
                </th> */}
                <th
                  className="text-end"
                  onClick={() => requestSort("points")}
                  style={{ cursor: "pointer" }}
                >
                  แต้ม {renderSortIcon("points")}
                </th>
                <th
                  className="text-end"
                  onClick={() => requestSort("orderCount")}
                  style={{ cursor: "pointer" }}
                >
                  ออเดอร์ (ครั้ง) {renderSortIcon("orderCount")}
                </th>
                <th
                  className="text-end"
                  onClick={() => requestSort("totalSpent")}
                  style={{ cursor: "pointer" }}
                >
                  ยอดใช้จ่ายรวม {renderSortIcon("totalSpent")}
                </th>
              </tr>
            </thead>
            {renderTableBody()}
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CustomerDataTable;