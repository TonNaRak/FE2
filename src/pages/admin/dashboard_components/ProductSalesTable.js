import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Table, Spinner } from "react-bootstrap";
import { format } from "date-fns";
import "./ProductSalesTable.css";

const numericKeys = new Set(["totalQuantity", "totalRevenue"]);

const sortArray = (arr, { key, direction }) => {
  const isNumeric = numericKeys.has(key);
  const Afirst = direction === "asc" ? 1 : -1;
  const Bfirst = -Afirst;

  return [...arr].sort((a, b) => {
    const A = isNumeric ? Number(a[key] ?? 0) : String(a[key] ?? "");
    const B = isNumeric ? Number(b[key] ?? 0) : String(b[key] ?? "");
    if (isNumeric) {
      return A < B ? Bfirst : A > B ? Afirst : 0;
    }
    return direction === "asc"
      ? A.localeCompare(B, "th")
      : B.localeCompare(A, "th");
  });
};

const ProductSalesTable = ({ dateRange, selectedCategory }) => {
  const [salesData, setSalesData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "totalRevenue",
    direction: "desc",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
          params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        }
        if (selectedCategory) {
          params.append("categoryName", selectedCategory);
        }

        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/all-products-sales",
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        const normalized = (response.data || []).map((r) => ({
          ...r,
          totalQuantity: Number(r.totalQuantity) || 0,
          totalRevenue: Number(r.totalRevenue) || 0,
        }));

        setSalesData(normalized);
        setSortedData(sortArray(normalized, sortConfig));
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลตารางได้");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (dateRange) fetchSalesData();
  }, [dateRange, selectedCategory, sortConfig.key, sortConfig.direction]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const next = { key, direction };
    setSortConfig(next);
    setSortedData(sortArray(salesData, next));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return <span className="ms-1">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>;
  };

  const renderTbody = () => {
    if (isLoading) {
      return (
        <tbody>
          <tr>
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
            <td colSpan="4" className="text-danger text-center p-5">
              {error}
            </td>
          </tr>
        </tbody>
      );
    }

    if (sortedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan="4" className="text-muted text-center p-5">
              ไม่มีข้อมูลการขายสำหรับช่วงเวลานี้
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {sortedData.map((item, idx) => (
          <tr key={idx}>
            <td>{item.productName}</td>
            <td>{item.categoryName}</td>
            <td className="text-end">
              {Number(item.totalQuantity).toLocaleString("th-TH")}
            </td>
            <td className="text-end">
              {Number(item.totalRevenue).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <Card style={{ height: "360px" }}>
      <Card.Header>
        <Card.Title as="h5" className="mb-0">
          สรุปยอดขายรายสินค้า
        </Card.Title>
      </Card.Header>

      {/* ทำส่วนตารางให้เลื่อนในตัว และหัวตาราง sticky */}
      <div className="product-table-scroll">
        <Table striped bordered hover responsive="sm" className="mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th
                className="sortable-header"
                onClick={() => handleSort("productName")}
              >
                ชื่อสินค้า {renderSortIcon("productName")}
              </th>
              <th
                className="sortable-header"
                onClick={() => handleSort("categoryName")}
              >
                หมวดหมู่ {renderSortIcon("categoryName")}
              </th>
              <th
                className="text-end sortable-header"
                onClick={() => handleSort("totalQuantity")}
              >
                จำนวน (ชิ้น) {renderSortIcon("totalQuantity")}
              </th>
              <th
                className="text-end sortable-header"
                onClick={() => handleSort("totalRevenue")}
              >
                ยอดขาย (บาท) {renderSortIcon("totalRevenue")}
              </th>
            </tr>
          </thead>
          {renderTbody()}
        </Table>
      </div>
    </Card>
  );
};

export default ProductSalesTable;
