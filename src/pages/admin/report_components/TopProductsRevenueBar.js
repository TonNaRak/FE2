import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
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
import { format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const TopProductsRevenueBar = ({
  selectedDate,
  title = "Top 5 สินค้ายอดขายสูงสุด (บาท) วันนี้",
}) => {
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!selectedDate) return;
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append("date", format(selectedDate, "yyyy-MM-dd"));
        params.append("limit", "5");

        const { data } = await axios.get(
          `${API_BASE}/api/admin/reports/top-products-revenue`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        setLabels(data.map((d) => d.productName));
        setValues(data.map((d) => Number(d.totalRevenue || 0)));
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดข้อมูลกราฟได้");
        setLabels([]);
        setValues([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  const maxVal = values.length ? Math.max(...values) : 0;
  const hasData = values.some((v) => v > 0);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "ยอดขาย (บาท)",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.85)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          barThickness: 24, // หนา
          borderRadius: 0,  // มุมเหลี่ยม
        },
      ],
    }),
    [labels, values]
  );

  const options = useMemo(
    () => ({
      indexAxis: "y", // แนวนอน
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, right: 18, bottom: 12, left: 10 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x.toLocaleString("th-TH")} บาท`,
          },
        },
        datalabels: {
          display: (ctx) => Number(ctx.dataset.data[ctx.dataIndex]) > 0,
          anchor: "end",
          align: "end",
          offset: 6,
          color: "#333",
          font: { size: 11, weight: "bold" },
          formatter: (v) => `${Number(v).toLocaleString("th-TH")} บาท`,
          clip: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: maxVal * 1.15,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            callback: (v) => Number(v).toLocaleString("th-TH"),
            color: "#333",
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#333",
            callback: function (val) {
              const label = this.getLabelForValue(val);
              return label.length > 24 ? label.slice(0, 24) + "…" : label;
            },
          },
        },
      },
    }),
    [maxVal]
  );

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{title}</Card.Title>
        <div className="flex-grow-1" style={{ position: "relative", minHeight: 350 }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : err ? (
            <p className="text-danger text-center">{err}</p>
          ) : !hasData ? (
            <p className="text-muted text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <Bar data={data} options={options} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopProductsRevenueBar;
