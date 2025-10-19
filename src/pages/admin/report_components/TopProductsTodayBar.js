// src/report_components/TopProductsTodayBar.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const TopProductsTodayBar = ({ selectedDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");
  const [axisMax, setAxisMax] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDate) return;
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("date", format(selectedDate, "yyyy-MM-dd"));

        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/top-products-today`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        const labels = data.map((item) => item.productName);
        const values = data.map((item) => item.totalQuantity);

        const maxVal = values.length > 0 ? Math.max(...values) : 10;
        setAxisMax(Math.ceil(maxVal * 1.25));

        setChartData({
          labels,
          datasets: [
            {
              label: "จำนวน (ชิ้น)",
              data: values,
              backgroundColor: "rgba(54, 162, 235, 0.8)", // ฟ้าเข้ม
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              barThickness: 26, // หนาแบบในไฟล์คุณ
              borderRadius: 0, // มุมเหลี่ยม
            },
          ],
        });
      } catch (err) {
        console.error("TopProductsToday error:", err);
        setError("ไม่สามารถโหลดข้อมูลกราฟได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 20 } },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#444",
        font: { weight: "bold" },
        formatter: (value) => `${value} ชิ้น`,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: axisMax,
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#333",
          callback: function (val) {
            const label = this.getLabelForValue(val);
            return label.length > 30 ? label.slice(0, 30) + "..." : label;
          },
        },
      },
    },
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>5 อันดับสินค้าขายดีของวันนี้</Card.Title>
        <div className="flex-grow-1" style={{ position: "relative", minHeight: "350px" }}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : !chartData || chartData.datasets[0].data.length === 0 ? (
            <p className="text-muted text-center">ไม่มีข้อมูลสินค้าขายดีสำหรับวันนี้</p>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopProductsTodayBar;
