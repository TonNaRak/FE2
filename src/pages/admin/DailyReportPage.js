import React, { useEffect, useState } from "react";
// Import Form เพิ่มเข้ามา และเปลี่ยน Card เป็น Card, Form
import { Row, Col, Card, Form } from "react-bootstrap";
import axios from "axios";
import { format } from "date-fns";

import SummaryCard from "./report_components/SummaryCard";
// ลบ SingleDateSlicer ออก เพราะเราจะสร้าง slicer เอง
// import SingleDateSlicer from "./report_components/SingleDateSlicer";
import HourlySalesLineChart from "./report_components/HourlySalesLineChart";
import HourlyOrdersLineChart from "./report_components/HourlyOrdersLineChart";
import ChannelSalesDonut from "./report_components/ChannelSalesDonut";
import TopProductsTodayBar from "./report_components/TopProductsTodayBar";
import TopCategoriesTodayBar from "./report_components/TopCategoriesTodayBar";
import OrderStatusTodayDonut from "./report_components/OrderStatusTodayDonut";
import TopProductsRevenueBar from "./report_components/TopProductsRevenueBar";
import TopCategoriesRevenueBar from "./report_components/TopCategoriesRevenueBar";

import {
  CashCoin,
  Cart4,
  Receipt,
  CurrencyDollar,
} from "react-bootstrap-icons";

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const DailyReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCashReceived: 0,
    totalChangeGiven: 0,
  });

  const fetchSummary = async (day) => {
    // เพิ่มการตรวจสอบ ถ้า day เป็น null (เช่น user ลบวันที่) ก็ไม่ต้อง fetch
    if (!day) {
      setLoading(false); // อาจจะเซ็ต loading false ด้วย
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      params.append("date", format(day, "yyyy-MM-dd"));

      const { data } = await axios.get(
        `${API_BASE}/api/admin/reports/daily-summary`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );

      setStats({
        totalSales: Number(data?.totalSales || 0),
        totalOrders: Number(data?.totalOrders || 0),
        totalCashReceived: Number(data?.totalCashReceived || 0),
        totalChangeGiven: Number(data?.totalChangeGiven || 0),
      });
    } catch (err) {
      console.error("Fetch daily summary failed:", err);
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalCashReceived: 0,
        totalChangeGiven: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    // เปลี่ยนจาก Container fluid มาใช้ layout นี้เหมือนหน้าอื่น
    <div className="d-flex flex-column gap-3">
      {/* ปรับ Header ให้เหมือนหน้า Yearly/Monthly */}
      <Row className="g-3 align-items-stretch">
        <Col xs={12} md={7}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-center py-2">
              <h4 className="mb-0">รายงานรายวัน</h4>
            </Card.Body>
          </Card>
        </Col>

        {/* สร้าง Slicer inline ให้เหมือนหน้าอื่น */}
        <Col xs={12} md={5}>
          <Card className="h-100">
            <Card.Body className="py-2">
              <Form>
                <Form.Label className="mb-1">เลือกวันรายงาน</Form.Label>
                <Form.Control
                  type="date"
                  // แปลง Date object เป็น string "yyyy-MM-dd"
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    // e.target.valueAsDate จะคืนค่าเป็น Date object (หรือ null)
                    // ซึ่งตรงกับ state selectedDate ที่เราใช้อยู่พอดี
                    setSelectedDate(e.target.valueAsDate)
                  }
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* การ์ด 4 ใบ */}
      <Row className="g-3">
        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="ยอดขายวันนี้"
            value={stats.totalSales}
            icon={<CurrencyDollar />}
            isLoading={loading}
            formatAsCurrency
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="จำนวนออเดอร์"
            value={stats.totalOrders}
            icon={<Cart4 />}
            isLoading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="เงินสดที่รับมา"
            value={stats.totalCashReceived}
            icon={<CashCoin />}
            isLoading={loading}
            formatAsCurrency
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <SummaryCard
            title="จำนวนเงินทอน"
            value={stats.totalChangeGiven}
            icon={<Receipt />}
            isLoading={loading}
            formatAsCurrency
          />
        </Col>
      </Row>

      {/* กราฟแถว 1 */}
      <Row className="g-3">
        <Col xs={6}>
          <HourlySalesLineChart selectedDate={selectedDate} />
        </Col>
        <Col xs={6}>
          <HourlyOrdersLineChart selectedDate={selectedDate} />
        </Col>
      </Row>

      {/* กราฟแถว 2 */}
      <Row className="g-3">
        <Col xs={12} md={4}>
          <ChannelSalesDonut selectedDate={selectedDate} />
        </Col>
        <Col xs={12} md={4}>
          <TopProductsTodayBar selectedDate={selectedDate} />
        </Col>
        <Col xs={12} md={4}>
          <TopCategoriesTodayBar selectedDate={selectedDate} />
        </Col>
      </Row>

      {/* กราฟแถว 3 */}
      <Row className="g-3">
        <Col xs={12} md={4}>
          <OrderStatusTodayDonut selectedDate={selectedDate} />
        </Col>
        <Col xs={12} md={4}>
          <TopProductsRevenueBar selectedDate={selectedDate} />{" "}
        </Col>
        <Col xs={12} md={4}>
          <TopCategoriesRevenueBar selectedDate={selectedDate} />
        </Col>
      </Row>
    </div>
  );
};

export default DailyReportPage;