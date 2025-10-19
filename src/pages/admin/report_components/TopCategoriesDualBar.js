import React, { useEffect, useState, useMemo } from "react";
import { Card, Spinner } from "react-bootstrap";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const TopCategoriesDualBar = ({ selectedMonth }) => {
  const [data, setData] = useState({ byRevenue: [], byQuantity: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMonth) return;
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${API_BASE}/api/admin/reports/monthly-top-categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { month: selectedMonth },
          }
        );
        setData(res.data || { byRevenue: [], byQuantity: [] });
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const hasRevenueData = data.byRevenue && data.byRevenue.length > 0;
  const hasQuantityData = data.byQuantity && data.byQuantity.length > 0;

  // ---------- กราฟบน: Top 5 ตาม "ยอดขาย" ----------
  const revLabels = data.byRevenue.map((d) => d.categoryName);
  const revValues = data.byRevenue.map((d) => Number(d.totalRevenue) || 0); // ⬅️ แปลงเป็น Number

  const revenueChart = useMemo(
    () => ({
      labels: revLabels,
      datasets: [
        {
          label: "ยอดขาย (บาท)",
          data: revValues,
          backgroundColor: "rgba(54,162,235,0.85)",
          borderRadius: 6,
        },
      ],
    }),
    [revLabels, revValues]
  );

  // ---------- กราฟล่าง: Top 5 ตาม "จำนวนชิ้น" ----------
  const qtyLabels = data.byQuantity.map((d) => d.categoryName);
  const qtyValues = data.byQuantity.map((d) => Number(d.totalQuantity) || 0); // ⬅️ แปลงเป็น Number

  const quantityChart = useMemo(
    () => ({
      labels: qtyLabels,
      datasets: [
        {
          label: "จำนวนชิ้น",
          data: qtyValues,
          backgroundColor: "rgba(255,159,64,0.85)",
          borderRadius: 6,
        },
      ],
    }),
    [qtyLabels, qtyValues]
  );

  const formatInt = (n) =>
    (Number(n) || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // ---------- ตัวเลือกทั่วไป ----------
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 10 } }, // ให้ headroom กับ datalabels
    plugins: {
      legend: {
        display: false,
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 12 } },
      },
      datalabels: {
        color: "#333",
        anchor: "end",
        align: "end",
        clamp: true,
        clip: true, // กันล้นแกน Y
        offset: -4, // ดึง label เข้ามานิด
        font: { size: 11, weight: "bold" },
        formatter: (value, context) => {
          const v = Number(value) || 0; // ⬅️ บังคับเป็น Number
          const dsLabel = context.dataset?.label || "";
          if (dsLabel.includes("บาท")) {
            return `${formatInt(v)} บาท`;
          }
          if (dsLabel.includes("ชิ้น")) {
            return `${formatInt(v)} ชิ้น`;
          }
          return formatInt(v);
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.parsed.y) || 0; // ⬅️ บังคับเป็น Number
            const formatted = formatInt(v);
            if (ctx.dataset.label.includes("บาท")) {
              return `${ctx.dataset.label}: ${formatted} บาท`;
            }
            if (ctx.dataset.label.includes("ชิ้น")) {
              return `${ctx.dataset.label}: ${formatted} ชิ้น`;
            }
            return `${ctx.dataset.label}: ${formatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          maxRotation: 0,
          callback: function (val) {
            const label = this.getLabelForValue(val) || "";
            return label.length > 12 ? label.substring(0, 12) + "…" : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        grace: "20%", // headroom กัน label ทะลุ
        grid: { color: "rgba(0,0,0,0.05)", lineWidth: 1 },
        ticks: {
          font: { size: 11 },
          callback: (v) => formatInt(v), // ⬅️ y-ticks ไม่มีทศนิยม
        },
      },
    },
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="mb-3">
          Top 5 หมวดหมู่ขายดีของเดือน (บาท / จำนวนชิ้น)
        </Card.Title>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" />
          </div>
        ) : err ? (
          <p className="text-danger text-center">{err}</p>
        ) : !hasRevenueData && !hasQuantityData ? (
          <p className="text-muted text-center">ยังไม่มีข้อมูลเดือนนี้</p>
        ) : (
          <div className="d-flex flex-column" style={{ gap: 1 }}>
            <div>
              <div className="fw-semibold mb-1">ยอดขาย (บาท)</div>
              <div style={{ height: 200 }}>
                {hasRevenueData ? (
                  <Bar data={revenueChart} options={baseOptions} />
                ) : (
                  <p className="text-muted text-center">ไม่มีข้อมูลยอดขาย</p>
                )}
              </div>
            </div>

            <div>
              <div className="fw-semibold mb-1">จำนวนชิ้น</div>
              <div style={{ height: 200 }}>
                {hasQuantityData ? (
                  <Bar data={quantityChart} options={baseOptions} />
                ) : (
                  <p className="text-muted text-center">ไม่มีข้อมูลจำนวนชิ้น</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TopCategoriesDualBar;
