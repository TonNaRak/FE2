// src/report_components/TopCategoriesTodayBar.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
import { Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_BASE = "https://api.souvenir-from-lagoon-thailand.com";

const TopCategoriesTodayBar = ({ selectedDate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState([]);
  const [counts, setCounts] = useState([]);
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
          `${API_BASE}/api/admin/reports/top-categories-today`,
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        setLabels(data.map(d => d.categoryName));
        setCounts(data.map(d => Number(d.totalQuantity || 0)));
      } catch (e) {
        console.error("Fetch top categories today failed:", e);
        setLabels([]);
        setCounts([]);
        setError("ไม่สามารถโหลดข้อมูลกราฟได้");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  const maxVal = counts.length ? Math.max(...counts) : 0;
  const hasData = counts.some(v => v > 0);

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "จำนวน (ชิ้น)",
        data: counts,
        backgroundColor: "rgba(54, 162, 235, 0.85)", // โทนฟ้าเข้ม
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        barThickness: 26,   // หนา
        borderRadius: 0,    // เหลี่ยม
      },
    ],
  }), [labels, counts]);

  const options = useMemo(() => ({
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 20, bottom: 12, left: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x?.toLocaleString("th-TH")} ชิ้น`,
        },
      },
      datalabels: {
        display: (ctx) => {
          const v = ctx?.dataset?.data?.[ctx.dataIndex];
          return Number.isFinite(v) && v > 0;
        },
        anchor: "end",
        align: "end",
        offset: 6,
        color: "#333",
        font: { size: 11, weight: "bold" },
        formatter: (v) => `${Number(v).toLocaleString("th-TH")} ชิ้น`,
        clamp: true,
        clip: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: maxVal * 1.15, // เว้นที่หัวกราฟ
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#333",
          callback: function (val) {
            const label = this.getLabelForValue(val);
            return label.length > 28 ? label.slice(0, 28) + "…" : label;
          },
        },
      },
    },
  }), [maxVal]);

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>Top 5 หมวดหมู่สินค้าขายดีของวันนี้</Card.Title>
        <div className="flex-grow-1" style={{ position: "relative", minHeight: "350px" }}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : !hasData ? (
            <p className="text-muted text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <Bar data={data} options={options} plugins={[ChartDataLabels]} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopCategoriesTodayBar;
