import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import SummaryCard from "./dashboard_components/SummaryCard";
import CustomerGrowthChart from "./dashboard_components/CustomerGrowthChart";
import TopSpendersChart from "./dashboard_components/TopSpendersChart";
import TopFrequentCustomersChart from "./dashboard_components/TopFrequentCustomersChart";
import CustomerSegmentationChart from "./dashboard_components/CustomerSegmentationChart";
import CustomerDataTable from "./dashboard_components/CustomerDataTable";
import CustomerDateRangeSlider from "./dashboard_components/CustomerDateRangeSlider";
import "./DashboardPage.css";
import axios from "axios";
import { PeopleFill, ArrowRepeat, StarFill } from "react-bootstrap-icons";
import { Row, Col, Card } from "react-bootstrap"; // Import Card เพิ่ม

const DashboardCustomersPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  const fetchData = useCallback(async (range) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      if (range?.from && range?.to) {
        params.append("startDate", format(range.from, "yyyy-MM-dd"));
        params.append("endDate", format(range.to, "yyyy-MM-dd"));
      }

      const response = await axios.get(
        "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/customer-summary",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        }
      );
      setSummaryData(response.data);
    } catch (error) {
      console.error("Error fetching customer summary:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    fetchData(range);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header mb-4">
        <h2>ภาพรวมลูกค้า</h2>
      </div>

      {/* --- Row 1: Cards & Slicer --- */}
      <Row className="g-3 mb-4">
        <Row className="g-3">
          <Col md={3}>
            <SummaryCard
              title="ลูกค้าทั้งหมด"
              value={summaryData?.totalCustomers}
              isLoading={isLoading}
              icon={<PeopleFill />}
            />
          </Col>
          <Col md={3}>
            <SummaryCard
              title="ลูกค้าที่กลับมาซื้อซ้ำ"
              value={summaryData?.returningCustomers}
              isLoading={isLoading}
              icon={<ArrowRepeat />}
            />
          </Col>
          <Col md={3}>
            <SummaryCard
              title="แต้มสะสมทั้งหมด"
              value={summaryData ? parseInt(summaryData.totalPoints, 10) : 0}
              isLoading={isLoading}
              icon={<StarFill />}
            />
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <CustomerDateRangeSlider
                  onDateRangeChange={handleDateRangeChange}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* <Col lg={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6" className="mb-3 text-muted">
                ตัวกรองวันที่
              </Card.Title>
              <CustomerDateRangeSlider
                onDateRangeChange={handleDateRangeChange}
              />
            </Card.Body>
          </Card>
        </Col> */}
      </Row>

      {/* --- Row 2: Growth Chart & Top Charts --- */}
      <Row className="g-3 mb-4">
        <Col lg={7}>
          <CustomerGrowthChart dateRange={dateRange} />
        </Col>
        <Col lg={5}>
          <Row className="g-3">
            <Col xs={12}>
              <TopSpendersChart dateRange={dateRange} />
            </Col>
            <Col xs={12}>
              <TopFrequentCustomersChart dateRange={dateRange} />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* --- Row 3: Segmentation & Data Table --- */}
      <Row className="g-3">
        <Col xl={4}>
          <CustomerSegmentationChart dateRange={dateRange} />
        </Col>
        <Col xl={8}>
          <CustomerDataTable dateRange={dateRange} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardCustomersPage;
