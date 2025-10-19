// src/report_components/ChannelSalesDonut.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const ChannelSalesDonut = ({ selectedDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState({ onlineSales: 0, inStoreSales: 0 });

  useEffect(() => {
    const load = async () => {
      if (!selectedDate) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("date", format(selectedDate, "yyyy-MM-dd"));

        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/channel-sales`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        setSales({
          onlineSales: Number(data?.onlineSales || 0),
          inStoreSales: Number(data?.inStoreSales || 0),
        });
      } catch (e) {
        console.error("Fetch channel sales failed:", e);
        setSales({ onlineSales: 0, inStoreSales: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  const total = (sales.onlineSales || 0) + (sales.inStoreSales || 0);
  const hasData = total > 0;

  const chartData = useMemo(() => ({
    labels: ["ออนไลน์", "หน้าร้าน"],
    datasets: [
      {
        label: "ยอดขาย (บาท)",
        data: [sales.onlineSales || 0, sales.inStoreSales || 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.75)", // ฟ้า: ออนไลน์
          "rgba(75, 192, 192, 0.75)", // เขียว: หน้าร้าน
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  }), [sales]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 12, bottom: 16, left: 12 } },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
              maximumFractionDigits: 0,
            }).format(ctx.parsed || 0)}`,
          footer: (items) => {
            const sum = items.reduce((a, i) => a + (i.parsed || 0), 0);
            return `รวม: ${new Intl.NumberFormat("th-TH", {
              style: "currency", currency: "THB", maximumFractionDigits: 0,
            }).format(sum)}`;
          },
        },
      },
      datalabels: {
        color: "#222",
        font: { weight: "bold", size: 11 },
        formatter: (value, ctx) => {
          if (!value) return "";
          const pct = total ? (value / total) * 100 : 0;
          return `${new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value)}\n(${pct.toFixed(0)}%)`;
        },
        anchor: "center",
        align: "center",
        clamp: true,
        clip: false,
      },
    },
    cutout: "58%",
  }), [total]);

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column pb-3" style={{ minHeight: 0 }}>
        <Card.Title as="h6">ยอดขายตามช่องทาง</Card.Title>
        <div className="flex-grow-1" style={{ position: "relative", height: 260, minHeight: 0 }}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : !hasData ? (
            <div className="text-muted d-flex justify-content-center align-items-center h-100">
              ยังไม่มีข้อมูลของวันนี้
            </div>
          ) : (
            <Doughnut data={chartData} options={options} plugins={[ChartDataLabels]} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ChannelSalesDonut;
