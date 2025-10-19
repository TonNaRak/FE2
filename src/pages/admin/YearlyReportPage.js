// src/pages/YearlyReportPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Form, Spinner } from "react-bootstrap";
import SummaryCard from "./report_components/SummaryCard";
import {
  CurrencyDollar,
  Cart4,
  Receipt,
  PersonPlus,
} from "react-bootstrap-icons";

import MonthlyTotalSalesTrend from "./report_components/MonthlyTotalSalesTrend";
import YearlyChannelBreakdownCard from "./report_components/YearlyChannelBreakdownCard";
import YearlyTopProductsDualBar from "./report_components/YearlyTopProductsDualBar";
import YearlyTopCategoriesDualBar from "./report_components/YearlyTopCategoriesDualBar";
import YearlyCustomerSegmentationChart from "./report_components/YearlyCustomerSegmentationChart";
import YearlyCancelRatioCard from "./report_components/YearlyCancelRatioCard";

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const YearlyReportPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    newCustomers: 0,
  });

  // โหลดสรุปรายปี
  useEffect(() => {
    const fetchYearly = async () => {
      if (!selectedYear) return;
      setLoading(true);
      setErrorText("");

      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/yearly-summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: selectedYear },
          }
        );

        setStats({
          totalSales: Number(data?.totalSales || 0),
          totalOrders: Number(data?.totalOrders || 0),
          avgOrderValue: Number(data?.avgOrderValue || 0),
          newCustomers: Number(data?.newCustomers || 0),
        });
      } catch (err) {
        console.error("Load yearly summary failed:", err);
        setErrorText("ไม่สามารถโหลดข้อมูลรายงานรายปีได้");
        setStats({
          totalSales: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          newCustomers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchYearly();
  }, [selectedYear]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Title + Year Slicer */}
      <Row className="g-3 align-items-stretch">
        {/* ส่วนหัวรายงาน */}
        <Col xs={12} md={7}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center py-2">
              <h4 className="mb-0">รายงานรายปี</h4>
            </Card.Body>
          </Card>
        </Col>

        {/* ส่วนเลือกปี */}
        <Col xs={12} md={5}>
          <Card className="h-100">
            <Card.Body className="py-2">
              <Form>
                <Form.Label className="mb-1">เลือกปี</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedYear}
                  min={2000}
                  max={currentYear + 1}
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error */}
      {errorText ? (
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body className="py-4 d-flex justify-content-center">
                <span className="text-danger">{errorText}</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}

      {/* Summary Cards (4 ใบ เหมือนรายเดือน) */}
      <Row className="g-3">
        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="ยอดขายรวม (บาท)"
            value={stats.totalSales}
            icon={<CurrencyDollar />}
            isLoading={loading}
            formatAsCurrency
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="จำนวนออเดอร์ทั้งหมด"
            value={stats.totalOrders}
            icon={<Cart4 />}
            isLoading={loading}
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="มูลค่าเฉลี่ยต่อออเดอร์ (บาท)"
            value={stats.avgOrderValue}
            icon={<Receipt />}
            isLoading={loading}
            formatAsCurrency
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="ลูกค้าใหม่ในปีนี้"
            value={stats.newCustomers}
            icon={<PersonPlus />}
            isLoading={loading}
          />
        </Col>
      </Row>

      {/* เปลี่ยนจาก g-3 mb-3 เป็น g-3 */}
      <Row className="g-3">
        <Col xs={12} lg={8}>
          <MonthlyTotalSalesTrend selectedYear={selectedYear} />
        </Col>
        {/* อาจมี card อื่นด้านข้าง */}
        <Col xs={12} lg={4}>
          <YearlyChannelBreakdownCard selectedYear={selectedYear} />
        </Col>
      </Row>

      {/* เปลี่ยนจาก g-3 mb-3 เป็น g-3 */}
      <Row className="g-3">
        <Col xs={12} lg={4}>
          <YearlyTopProductsDualBar selectedYear={selectedYear} />
        </Col>
        <Col xs={12} lg={4}>
          <YearlyTopCategoriesDualBar selectedYear={selectedYear} />
        </Col>
        <Col xs={12} lg={4} className="d-flex">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
              minHeight: 0,
              height: "100%",
            }}
          >
            <div style={{ flex: "1 1 0", minHeight: 0 }} className="d-flex">
              <YearlyCustomerSegmentationChart selectedYear={selectedYear} />
            </div>
            <div style={{ flex: "1 1 0", minHeight: 0 }} className="d-flex">
              <YearlyCancelRatioCard selectedYear={selectedYear} />
            </div>
          </div>
        </Col>
      </Row>

      {/* พื้นที่สำหรับกราฟ/ตารางรายปีอื่น ๆ (ค่อยต่อเติม) */}
      {/* ตัวอย่าง: แยกเพิ่ม daily trend/ channel breakdown/ top categories/products รายปี ได้ในอนาคต */}
    </div>
  );
};

export default YearlyReportPage;