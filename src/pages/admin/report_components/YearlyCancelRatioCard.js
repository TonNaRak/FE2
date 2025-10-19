import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const thInt = (n) =>
  (Number(n) || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const thMoney = (n) =>
  (Number(n) || 0).toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const YearlyCancelRatioCard = ({ selectedYear }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({
    cancelledCount: 0,
    successCount: 0,
    totalFinal: 0,
    cancelRatePercent: 0,
    cancelledValue: 0,
    successValue: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!selectedYear) return;
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${API_BASE}/api/admin/reports/yearly-cancel-ratio`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: selectedYear },
          }
        );
        setStats({
          cancelledCount: Number(res.data?.cancelledCount || 0),
          successCount: Number(res.data?.successCount || 0),
          totalFinal: Number(res.data?.totalFinal || 0),
          cancelRatePercent: Number(res.data?.cancelRatePercent || 0),
          cancelledValue: Number(res.data?.cancelledValue || 0),
          successValue: Number(res.data?.successValue || 0),
          totalValue: Number(res.data?.totalValue || 0),
        });
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedYear]);

  const hasData = stats.totalFinal > 0;

  const chartData = useMemo(
    () => ({
      labels: ["ยกเลิก", "สำเร็จ"],
      datasets: [
        {
          data: [stats.cancelledCount, stats.successCount],
          backgroundColor: [
            "rgba(220, 53, 69, 0.85)",
            "rgba(25, 135, 84, 0.85)",
          ],
          borderColor: ["rgba(220,53,69,1)", "rgba(25,135,84,1)"],
          borderWidth: 1,
          hoverOffset: 6,
        },
      ],
    }),
    [stats.cancelledCount, stats.successCount]
  );

  const percent = (value, total) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "30%",
      layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const v = ctx.parsed || 0;
              const p = percent(v, stats.totalFinal);
              const valueTHB =
                label === "ยกเลิก" ? stats.cancelledValue : stats.successValue;
              return [
                ` ${label}: ${thInt(v)} ออเดอร์ (${p}%)`,
                ` มูลค่า: ${thMoney(valueTHB)}`,
              ];
            },
          },
        },
        datalabels: {
          color: "#333",
          font: { size: 11, weight: "bold" },
          formatter: (value, ctx) => {
            if (value <= 0) return null;
            const p = percent(value, stats.totalFinal);
            return `${thInt(value)} ออเดอร์\n(${p}%)`;
          },
        },
      },
    }),
    [stats.totalFinal, stats.cancelledValue, stats.successValue]
  );

  return (
    <Card className="h-100 w-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>สัดส่วนการยกเลิกออเดอร์ (รายปี)</Card.Title>

        <div
          className="flex-grow-1"
          style={{
            position: "relative",
            height: "100%",
            minHeight: 200,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : err ? (
            <p className="text-danger text-center">{err}</p>
          ) : !hasData ? (
            <p className="text-muted text-center">ยังไม่มีข้อมูลในปีนี้</p>
          ) : (
            <Doughnut data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default YearlyCancelRatioCard;
