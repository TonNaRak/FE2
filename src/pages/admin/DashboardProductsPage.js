import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Card, Button } from "react-bootstrap";
import SummaryCard from "./dashboard_components/SummaryCard";
import DateRangeSlider from "./dashboard_components/DateRangeSlider";
import TopProductsChart from "./dashboard_components/TopProductsChart";
import TopRevenueProductsChart from "./dashboard_components/TopRevenueProductsChart";
import { BoxSeam, TagsFill, FunnelFill } from "react-bootstrap-icons";
import CategorySalesTreemap from "./dashboard_components/CategorySalesTreemap";
import ProductSalesTable from "./dashboard_components/ProductSalesTable";
import ProductStatusChart from "./dashboard_components/ProductStatusChart";
import CategorySlicer from "./dashboard_components/CategorySlicer";

const DashboardProductsPage = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProductSummary = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (selectedCategory) {
          params.append("categoryName", selectedCategory);
        }

        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/product-summary",
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }
        );
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch product summary", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductSummary();
  }, [selectedCategory]);

  return (
    <div>
      <h4>ข้อมูลสินค้าและหมวดหมู่</h4>
      <hr />

      {/* {selectedCategory && (
        <div className="mb-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            <FunnelFill className="me-2" />
            ล้างตัวกรองหมวดหมู่: <strong>{selectedCategory}</strong>
          </Button>
        </div>
      )} */}

      <Row className="gy-4 mb-4">
        <Col lg={3}>
          <SummaryCard
            className="w-100"
            title="สินค้าทั้งหมด"
            value={summary?.totalProducts}
            isLoading={isLoading}
            icon={<BoxSeam />}
          />
        </Col>
        <Col lg={3}>
          <SummaryCard
            className="w-100"
            title="หมวดหมู่ทั้งหมด"
            value={summary?.totalCategories}
            isLoading={isLoading}
            icon={<TagsFill />}
          />
        </Col>

        <Col lg={6} className="d-flex">
          <Card className="w-100">
            <Card.Body>
              {/* ใช้ Row และ Col เพื่อจัด Slicer แนวนอน */}
              <Row className="align-items-center">
                <Col md={7}>
                  <DateRangeSlider onDateRangeChange={setDateRange} />
                </Col>
                <Col md={5}>
                  <CategorySlicer
                    onCategoryChange={setSelectedCategory}
                    selectedCategory={selectedCategory}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="gy-4 mb-4">
        <Col lg={8}>
          <Row className="gy-4">
            <Col xl={6}>
              {/* --- [ แก้ไข ] --- ส่ง selectedCategory ไปให้กราฟ --- */}
              <TopProductsChart
                dateRange={dateRange}
                selectedCategory={selectedCategory}
              />
            </Col>
            <Col xl={6}>
              {/* --- [ แก้ไข ] --- ส่ง selectedCategory ไปให้กราฟ --- */}
              <TopRevenueProductsChart
                dateRange={dateRange}
                selectedCategory={selectedCategory}
              />
            </Col>
          </Row>
        </Col>
        <Col lg={4}>
          <ProductStatusChart />
        </Col>
      </Row>

      <Row className="gy-4">
        <Col lg={6}>
          {/* --- [ แก้ไข ] --- ส่ง props สำหรับการคลิกไปให้ Treemap --- */}
          <CategorySalesTreemap
            dateRange={dateRange}
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </Col>
        <Col lg={6}>
          {/* --- [ แก้ไข ] --- ส่ง selectedCategory ไปให้ตาราง --- */}
          <ProductSalesTable
            dateRange={dateRange}
            selectedCategory={selectedCategory}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardProductsPage;
