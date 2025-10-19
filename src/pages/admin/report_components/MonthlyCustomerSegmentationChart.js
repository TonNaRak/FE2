import React, { useState, useEffect } from "react";
import axios from "axios";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Card, Spinner } from "react-bootstrap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const MonthlyCustomerSegmentationChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedMonth) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/reports/monthly-customer-segmentation",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { month: selectedMonth },
          }
        );

        const { scatterData, averages } = response.data;

        if (scatterData.length > 0) {
          setChartData({
            datasets: [
              {
                label: "ลูกค้า",
                data: scatterData,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
              },
            ],
            averages,
          });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error("Error loading segmentation:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const p = ctx.raw;
            return `${p.username}: ${p.x} ครั้ง, ${p.y.toLocaleString(
              "th-TH"
            )} บาท`;
          },
        },
      },
      datalabels: {
        display: false,
      },
      annotation: {
        annotations: {
          avgFreq: {
            type: "line",
            xMin: chartData?.averages.avgFrequency,
            xMax: chartData?.averages.avgFrequency,
            borderColor: "rgba(255, 99, 132, 0.7)",
            borderWidth: 2,
            borderDash: [5, 5],
          },
          avgMon: {
            type: "line",
            yMin: chartData?.averages.avgMonetary,
            yMax: chartData?.averages.avgMonetary,
            borderColor: "rgba(255, 206, 86, 0.7)",
            borderWidth: 2,
            borderDash: [5, 5],
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "จำนวนออเดอร์ (ครั้ง)" },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: "ยอดสั่งซื้อรวม (บาท)" },
        beginAtZero: true,
      },
    },
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" />
        </div>
      );
    if (error)
      return (
        <p className="text-danger text-center h-100 d-flex align-items-center justify-content-center">
          {error}
        </p>
      );
    if (!chartData)
      return (
        <p className="text-muted text-center h-100 d-flex align-items-center justify-content-center">
          ไม่มีข้อมูลในเดือนนี้
        </p>
      );
    return <Scatter data={chartData} options={options} />;
  };

  return (
    <Card className="h-100 w-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h6">การแบ่งกลุ่มลูกค้า (รายเดือน)</Card.Title>
        <div
          className="flex-grow-1 w-100"
          style={{ position: "relative", height: "100%", minHeight: 200 }}
        >
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MonthlyCustomerSegmentationChart;
