// /mnt/data/CustomerGrowthChart.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, Spinner } from "react-bootstrap";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const CustomerGrowthChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerGrowth = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
            params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
            params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
        }
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/monthly-new-customers",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: params,
          }
        );

        const data = response.data || [];
        // จัดรูปแบบ label ให้ตรงกับ MonthlySalesChart (MMM yyyy ภาษาไทย)
        const labels = data.map((item) =>
          format(parseISO(item.month), "MMM yyyy", { locale: th })
        );
        const newCustomerCounts = data.map((item) => item.newCustomerCount);

        setChartData({
          labels,
          datasets: [
            {
              label: "ลูกค้าใหม่",
              data: newCustomerCounts,
              fill: true,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching customer growth data:", err);
        setError("ไม่สามารถโหลดข้อมูลกราฟได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerGrowth();
  }, [dateRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: (context) => {
          const val = context.dataset.data[context.dataIndex];
          return typeof val === "number" && val > 0;
        },
        anchor: "end",
        align: "top",
        color: "#36A2EB",
        font: { weight: "bold" },
        formatter: (value) => {
          // แสดงเป็นจำนวนเต็มแบบย่อ (ไม่มีทศนิยม)
          return new Intl.NumberFormat("th-TH", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 0,
          }).format(value);
        },
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 4,
        padding: 4,
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `ลูกค้าใหม่: ${new Intl.NumberFormat("th-TH").format(
              ctx.parsed.y
            )} คน`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true, // เส้น grid แนวตั้ง
          drawOnChartArea: true,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true, // เส้น grid แนวนอน
          drawOnChartArea: true,
        },
        ticks: {
          // บังคับให้เป็นจำนวนเต็มเท่านั้น (ไม่มีทศนิยม)
          stepSize: 1, // ถ้าข้อมูลมีช่วงกว้าง ChartJS อาจเลือก step ใหญ่ขึ้น แต่ยังเป็นจำนวนเต็ม
          callback: (value) => {
            // แสดงเฉพาะค่าที่เป็นจำนวนเต็ม และไม่มีทศนิยม
            if (Number.isInteger(value)) {
              return new Intl.NumberFormat("th-TH", {
                maximumFractionDigits: 0,
              }).format(value);
            }
            return null;
          },
        },
        afterDataLimits: (axis) => {
          // ป้องกันเคสข้อมูลว่างหรือเป็น 0 ทั้งหมด
          const computedMax = Math.ceil(axis.max ?? 0);
          axis.max = Math.max(computedMax + 1, 1); // อย่างต่ำให้เป็น 1
        },
      },
    },
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" />
        </div>
      );
    }
    if (error) {
      return <p className="text-danger text-center">{error}</p>;
    }
    if (!chartData || chartData.datasets[0].data.length === 0) {
      return (
        <p className="text-muted text-center">
          ไม่มีข้อมูลลูกค้าใหม่สำหรับช่วงเวลานี้
        </p>
      );
    }
    return <Line options={options} data={chartData} />;
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        {/* ตั้งชื่อกราฟให้สอดคล้องกับ MonthlySalesChart */}
        <Card.Title>ลูกค้าใหม่รายเดือน</Card.Title>
        <div
          className="flex-grow-1"
          style={{ position: "relative", minHeight: "300px" }}
        >
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CustomerGrowthChart;
