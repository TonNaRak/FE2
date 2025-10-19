// src/report_components/OrderStatusTodayDonut.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const OrderStatusTodayDonut = ({
  selectedDate,
  title = "สถานะออเดอร์วันนี้ (สำเร็จ vs ยกเลิก)",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!selectedDate) return;
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("date", format(selectedDate, "yyyy-MM-dd"));

        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/order-status-today`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        setSuccess(Number(data?.success || 0));
        setCancelled(Number(data?.cancelled || 0));
      } catch (e) {
        console.error("Fetch order status today failed:", e);
        setError("ไม่สามารถโหลดข้อมูลกราฟได้");
        setSuccess(0);
        setCancelled(0);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  const total = success + cancelled;
  const hasData = total > 0;

  const chartData = useMemo(
    () => ({
      labels: ["สำเร็จ", "ยกเลิก"],
      datasets: [
        {
          label: "จำนวนออเดอร์",
          data: [success, cancelled],
          backgroundColor: [
            "rgba(25,135,84,0.85)", // เขียว
            "rgba(220,53,69,0.85)", // แดง
          ],
          borderColor: ["rgba(25,135,84,1)", "rgba(220,53,69,1)"],
          borderWidth: 1,
          cutout: "55%", // โดนัท
        },
      ],
    }),
    [success, cancelled]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 12, right: 12, bottom: 18, left: 12 } },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${v.toLocaleString(
              "th-TH"
            )} ออเดอร์ (${pct}%)`;
          },
        },
      },
      datalabels: {
        display: (ctx) => {
          const v = ctx.dataset.data[ctx.dataIndex];
          return Number(v) > 0;
        },
        anchor: "center",
        align: "center",
        color: "#fff",
        font: { weight: "bold" },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}\n${value.toLocaleString("th-TH")} (${pct}%)`;
        },
        clip: false,
      },
    },
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{title}</Card.Title>
        <div
          className="flex-grow-1"
          style={{ position: "relative", minHeight: 300 }}
        >
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : !hasData ? (
            <p className="text-muted text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <Doughnut data={chartData} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderStatusTodayDonut;
