// src/pages/report_components/MonthlyTotalSalesTrend.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const MonthlyTotalSalesTrend = ({ selectedYear }) => {
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!selectedYear) return;
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${API_BASE}/api/admin/reports/monthly-total-sales-trend`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: selectedYear },
          }
        );
        setDataRows(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดข้อมูลยอดขายรายเดือน");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedYear]);

  const hasData = useMemo(
    () => dataRows.some((r) => Number(r.totalSales) > 0),
    [dataRows]
  );

  const chartData = useMemo(() => {
    const monthLabels = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    return {
      labels: monthLabels,
      datasets: [
        {
          label: "ยอดขายรวม (บาท)",
          data: dataRows.map((r) => r.totalSales),
          borderColor: "rgba(75,192,192,1)", // สีเดียวกับ daily
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
    };
  }, [dataRows]);

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
          title: { display: true, text: "เดือนของปี" },
        },
        y: {
          beginAtZero: true,
          grace: "15%", // เพิ่มพื้นที่ด้านบน
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
        <Card.Title>แนวโน้มยอดขายรวมแต่ละเดือน</Card.Title>
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

export default MonthlyTotalSalesTrend;
