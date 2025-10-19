// src/pages/MonthlyReportPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Form, Spinner } from "react-bootstrap";
import { format } from "date-fns";

// ใช้ SummaryCard เดียวกับที่หน้า Daily ใช้อยู่
import SummaryCard from "./report_components/SummaryCard";
import DailyTotalSalesTrend from "./report_components/DailyTotalSalesTrend";
import MonthlyChannelBreakdownCard from "./report_components/MonthlyChannelBreakdownCard";
import TopCategoriesDualBar from "./report_components/TopCategoriesDualBar";
import TopProductsDualBar from "./report_components/TopProductsDualBar";
import MonthlyCustomerSegmentationChart from "./report_components/MonthlyCustomerSegmentationChart";
import MonthlyCancelRatioCard from "./report_components/MonthlyCancelRatioCard";

// ไอคอนเหมือนหน้า Daily
import {
  CurrencyDollar,
  Cart4,
  Receipt,
  PersonPlus,
} from "react-bootstrap-icons";

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const MonthlyReportPage = () => {
  // สร้างค่า month เริ่มต้นเป็นเดือนปัจจุบันรูปแบบ YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // สเตตการ์ดสรุป
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    newCustomers: 0,
  });

  // โหลดข้อมูลเมื่อเปลี่ยนเดือน
  useEffect(() => {
    const fetchMonthly = async () => {
      if (!selectedMonth) return;
      setLoading(true);
      setErrorText("");

      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("month", selectedMonth); // 'YYYY-MM'

        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/monthly-summary`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        setStats({
          totalSales: Number(data?.totalSales || 0),
          totalOrders: Number(data?.totalOrders || 0),
          avgOrderValue: Number(data?.avgOrderValue || 0),
          newCustomers: Number(data?.newCustomers || 0),
        });
      } catch (err) {
        console.error("Load monthly summary failed:", err);
        setErrorText("ไม่สามารถโหลดข้อมูลรายงานรายเดือนได้");
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

    fetchMonthly();
  }, [selectedMonth]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Title + Slicer (สไตล์เดียวกับหน้า Daily) */}
      <Row className="g-3 align-items-stretch">
        <Col xs={12} md={7}>
                  <Card className="h-100">
                    <Card.Body className="d-flex align-items-center py-2">
                      <h4 className="mb-0">รายงานรายเดือน</h4>
                    </Card.Body>
                  </Card>
                </Col>
        <Col xs={12} md={5}>
          <Card>
            <Card.Body className="py-2">
              <Form>
                <Form.Label className="mb-1">เลือกเดือน</Form.Label>
                <Form.Control
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error state */}
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

      {/* Summary Cards เหมือนหน้า Daily */}
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
            title="ลูกค้าใหม่ในเดือนนี้"
            value={stats.newCustomers}
            icon={<PersonPlus />}
            isLoading={loading}
          />
        </Col>
      </Row>

      {/* ตำแหน่งสำหรับกราฟ/ตารางรายเดือนอื่นๆ (เพิ่มภายหลังได้) */}

      {/* ลบ mb-3 ออก */}
      <Row className="g-3">
        <Col xs={12} lg={8}>
          <DailyTotalSalesTrend selectedMonth={selectedMonth} />
        </Col>
        <Col xs={12} lg={4}>
          <MonthlyChannelBreakdownCard selectedMonth={selectedMonth} />
        </Col>
      </Row>
      
      {/* ลบ mb-3 ออก */}
      <Row className="g-3">
        <Col xs={12} lg={4}>
          <TopProductsDualBar selectedMonth={selectedMonth} />
        </Col>
        <Col xs={12} lg={4}>
          <TopCategoriesDualBar selectedMonth={selectedMonth} />
        </Col>

        {/* ขวา: ซ้อน 2 การ์ดแบบยืดเต็มคอลัมน์ */}
        <Col xs={12} lg={4} className="d-flex ">
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
              <MonthlyCustomerSegmentationChart selectedMonth={selectedMonth} />
            </div>
            <div style={{ flex: "1 1 0", minHeight: 0 }} className="d-flex">
              <MonthlyCancelRatioCard selectedMonth={selectedMonth} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MonthlyReportPage;