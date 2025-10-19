import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const HourlyOrdersLineChart = ({ selectedDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!selectedDate) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("date", format(selectedDate, "yyyy-MM-dd"));

        // 🔹 เรียก API ใหม่สำหรับจำนวนออเดอร์รายชั่วโมง
        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/hourly-orders`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        const labels = data.map((d) => d.hour);
        const online = data.map((d) => d.onlineOrders);
        const inStore = data.map((d) => d.inStoreOrders);

        setSeries({ labels, online, inStore });
      } catch (e) {
        console.error("Fetch hourly orders failed:", e);
        setSeries({ labels: [], online: [], inStore: [] });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  const chartData = useMemo(
    () => ({
      labels: series.labels || [],
      datasets: [
        {
          label: "ออนไลน์",
          data: series.online || [],
          tension: 0.35,
          borderWidth: 3,
          borderColor: "rgba(255, 99, 132, 1)", // 🔴 สีแดงชมพู
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(255, 99, 132, 1)",
          fill: true,
          datalabels: {
            align: "end",
            anchor: "end",
            offset: 4,
            color: "#333",
            font: { size: 10, weight: "bold" },
            formatter: (v) => (v > 0 ? v.toLocaleString("th-TH") : ""),
          },
        },
        {
          label: "หน้าร้าน",
          data: series.inStore || [],
          tension: 0.35,
          borderWidth: 3,
          borderColor: "rgba(255, 206, 86, 1)", // 🟡 สีเหลืองทอง
          backgroundColor: "rgba(255, 206, 86, 0.1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(255, 206, 86, 1)",
          fill: true,
          datalabels: {
            align: "start",
            anchor: "start",
            offset: 4,
            color: "#333",
            font: { size: 10, weight: "bold" },
            formatter: (v) => (v > 0 ? v.toLocaleString("th-TH") : ""),
          },
        },
      ],
    }),
    [series]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 12, bottom: 16, left: 8 } },
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString("th-TH")} ออเดอร์`,
          },
        },
        datalabels: { clip: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.06)" },
          suggestedMax:
            Math.max(...(series?.online || []), ...(series?.inStore || []), 0) * 1.15,
          ticks: {
            callback: (v) => v.toLocaleString("th-TH"),
          },
        },
      },
    }),
    [series]
  );

  const hasData =
    series?.online?.some((v) => Number.isFinite(v) && v !== 0) ||
    series?.inStore?.some((v) => Number.isFinite(v) && v !== 0);

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column pb-3" style={{ minHeight: 0 }}>
        <Card.Title as="h6">จำนวนออเดอร์รายชั่วโมง (ออนไลน์ vs หน้าร้าน)</Card.Title>
        <div
          className="flex-grow-1"
          style={{ position: "relative", height: 280, minHeight: 0 }}
        >
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : !hasData ? (
            <div className="text-muted d-flex justify-content-center align-items-center h-100">
              ยังไม่มีข้อมูลของวันนี้
            </div>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default HourlyOrdersLineChart;
