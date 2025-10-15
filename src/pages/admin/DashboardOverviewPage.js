import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import OrderTypeChart from "./dashboard_components/OrderTypeChart";
import SummaryCard from "./dashboard_components/SummaryCard";
import DateRangeSlider from "./dashboard_components/DateRangeSlider"; // เปลี่ยนมาใช้ Slider
import { Row, Col, Card } from "react-bootstrap";
import {
  CashCoin,
  Cart4,
  PeopleFill,
  BarChartFill,
} from "react-bootstrap-icons";
import MonthlySalesChart from "./dashboard_components/MonthlySalesChart";
import TopProductsChart from "./dashboard_components/TopProductsChart";
import OrderStatusChart from "./dashboard_components/OrderStatusChart";

const DashboardOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null); // State นี้ยังคงใช้เหมือนเดิม

  const fetchData = async (range) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const params = new URLSearchParams();
      if (range?.from && range?.to) {
        params.append("startDate", format(range.from, "yyyy-MM-dd"));
        params.append("endDate", format(range.to, "yyyy-MM-dd"));
      }

      const [statsResponse] = await Promise.all([
        axios.get(
          `https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/summary-stats`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        ),
      ]);

      setStats(statsResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      // รอให้ dateRange มีค่าก่อนค่อยดึงข้อมูล
      fetchData(dateRange);
    }
  }, [dateRange]);

  return (
    <div>
      {/* ย้าย Slicer มาไว้ด้านบนสุด */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">ภาพรวม (Overview)</h4>
      </div>
      <Card className="mb-4">
        <Card.Body>
          {/* เปลี่ยนมาใช้ DateRangeSlider */}
          <DateRangeSlider onDateRangeChange={setDateRange} />
        </Card.Body>
      </Card>
      <hr />

      <Row className="g-3 mb-3">
        <Col md={6} lg={3}>
          <SummaryCard
            title="ยอดขายรวม"
            value={stats?.totalSales}
            isLoading={isLoading}
            icon={<CashCoin />}
            formatAsCurrency={true}
          />
        </Col>
        <Col md={6} lg={3}>
          <SummaryCard
            title="ออเดอร์ทั้งหมด"
            value={stats?.totalOrders}
            isLoading={isLoading}
            icon={<Cart4 />}
          />
        </Col>
        <Col md={6} lg={3}>
          <SummaryCard
            title="ลูกค้าทั้งหมด"
            value={stats?.totalCustomers}
            isLoading={isLoading}
            icon={<PeopleFill />}
          />
        </Col>
        <Col md={6} lg={3}>
          <SummaryCard
            title="ยอดขายเฉลี่ย/ออเดอร์"
            value={stats?.avgOrderValue}
            isLoading={isLoading}
            icon={<BarChartFill />}
            formatAsCurrency={true}
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <MonthlySalesChart dateRange={dateRange} />
        </Col>
        <Col lg={6}>
          <TopProductsChart dateRange={dateRange} />
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col lg={6}>
          <OrderStatusChart dateRange={dateRange} />
        </Col>
        <Col lg={6}>
          <OrderTypeChart dateRange={dateRange} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverviewPage;
