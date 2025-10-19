// src/pages/report_components/YearlyChannelBreakdownCard.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const YearlyChannelBreakdownCard = ({ selectedYear }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenueOnline: 0,
    revenueInStore: 0,
    ordersOnline: 0,
    ordersInStore: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!selectedYear) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${API_BASE}/api/admin/reports/yearly-channel-breakdown`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: selectedYear },
          }
        );
        setData(res.data || {});
      } catch (err) {
        console.error("Load yearly channel breakdown error:", err);
        setData({
          revenueOnline: 0,
          revenueInStore: 0,
          ordersOnline: 0,
          ordersInStore: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear]);

  const revTotal = (data.revenueOnline || 0) + (data.revenueInStore || 0);
  const ordTotal = (data.ordersOnline || 0) + (data.ordersInStore || 0);

  const moneyFmt = (v) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(v || 0);

  const revenueChart = useMemo(
    () => ({
      labels: ["ออนไลน์", "หน้าร้าน"],
      datasets: [
        {
          data: [data.revenueOnline, data.revenueInStore],
          backgroundColor: ["#36A2EB", "#198754"],
          borderColor: ["#36A2EB", "#198754"],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [data]
  );

  const ordersChart = useMemo(
    () => ({
      labels: ["ออนไลน์", "หน้าร้าน"],
      datasets: [
        {
          data: [data.ordersOnline, data.ordersInStore],
          backgroundColor: ["#9966FF", "#FF9F40"],
          borderColor: ["#9966FF", "#FF9F40"],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [data]
  );

  const donutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%", // เล็กลงหน่อยจาก 50% ให้ดูสวย
      animation: { duration: 1200, easing: "easeOutQuart" },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { font: { size: 13 }, padding: 16 },
        },
        datalabels: {
          color: "#222",
          font: { weight: "bold", size: 11 },
          formatter: (value) => {
            if (!revTotal || !value) return "";
            const pct = ((value / revTotal) * 100).toFixed(0);
            return `${moneyFmt(value)}\n(${pct}%)`;
          },
          textAlign: "center",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${moneyFmt(ctx.parsed)}`,
          },
        },
      },
    }),
    [revTotal]
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart" },
      layout: { padding: { bottom: 24 } },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { font: { size: 13 }, padding: 16 },
        },
        datalabels: {
          color: "#222",
          font: { weight: "bold", size: 11 },
          formatter: (value) => {
            if (!ordTotal || !value) return "";
            const pct = ((value / ordTotal) * 100).toFixed(0);
            return `${value.toLocaleString("th-TH")} ออเดอร์\n(${pct}%)`;
          },
          textAlign: "center",
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.label}: ${ctx.parsed.toLocaleString("th-TH")} ออเดอร์`,
          },
        },
      },
    }),
    [ordTotal]
  );

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-semibold mb-3">
          สัดส่วนตามช่องทาง (ยอดขาย & จำนวนออเดอร์ รวมทั้งปี)
        </Card.Title>

        <div className="flex-grow-1 d-flex flex-column gap-4">
          <div className="p-2" style={{ minHeight: 180, maxHeight: 220, position: "relative" }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" />
              </div>
            ) : revTotal > 0 ? (
              <>
                <div className="fw-semibold mb-2 text-center">ยอดขาย (บาท)</div>
                <Doughnut
                  data={revenueChart}
                  options={donutOptions}
                  plugins={[ChartDataLabels]}
                />
              </>
            ) : (
              <p className="text-muted text-center">
                ยังไม่มีข้อมูลยอดขายปีนี้
              </p>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />

          <div className="p-2" style={{ minHeight: 180, maxHeight: 220, position: "relative" }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" />
              </div>
            ) : ordTotal > 0 ? (
              <>
                <div className="fw-semibold mb-2 text-center">จำนวนออเดอร์</div>
                <Pie
                  data={ordersChart}
                  options={pieOptions}
                  plugins={[ChartDataLabels]}
                />
              </>
            ) : (
              <p className="text-muted text-center">
                ยังไม่มีข้อมูลจำนวนออเดอร์ปีนี้
              </p>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default YearlyChannelBreakdownCard;
