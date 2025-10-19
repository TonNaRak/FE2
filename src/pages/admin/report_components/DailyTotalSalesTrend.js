import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const DailyTotalSalesTrend = ({ selectedMonth }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dataRows, setDataRows] = useState([]);

  useEffect(() => {
    if (!selectedMonth) return;
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("month", selectedMonth);
        const res = await axios.get(
          `${API_BASE}/api/admin/reports/daily-total-sales-trend`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }
        );
        setDataRows(res.data || []);
      } catch (e) {
        console.error("Load daily sales trend error:", e);
        setErr("ไม่สามารถโหลดข้อมูลกราฟได้");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedMonth]);

  const hasData = useMemo(
    () => dataRows.some((r) => Number(r.totalSales) > 0),
    [dataRows]
  );

  const chartData = useMemo(
    () => ({
      labels: dataRows.map((r) => r.date.slice(-2)), // แสดงเฉพาะวันที่ เช่น '01', '02'
      datasets: [
        {
          label: "ยอดขายรวม (บาท)",
          data: dataRows.map((r) => r.totalSales),
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.15)",
          tension: 0.3,
          pointRadius: 3,
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
      ],
    }),
    [dataRows]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
                maximumFractionDigits: 0,
              }).format(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          title: { display: true, text: "วันของเดือน" },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "ยอดขาย (บาท)" },
          ticks: {
            callback: (v) =>
              new Intl.NumberFormat("th-TH", { notation: "compact" }).format(v),
          },
        },
      },
    }),
    []
  );

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>แนวโน้มยอดขายรวมแต่ละวัน</Card.Title>
        <div
          className="flex-grow-1"
          style={{ position: "relative", minHeight: "300px" }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : err ? (
            <p className="text-danger text-center">{err}</p>
          ) : !hasData ? (
            <p className="text-muted text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DailyTotalSalesTrend;
