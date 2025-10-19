// TopPointRedeemersChart.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Spinner } from "react-bootstrap";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const TopPointRedeemersChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState(null);
  const [axisMax, setAxisMax] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopPointRedeemers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
          params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        }

        const { data } = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/top-point-redeemers",
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        if (Array.isArray(data) && data.length > 0) {
          const labels = data.map((i) => i.username);
          const points = data.map((i) => Number(i.totalRedeemedPoints) || 0);
          const counts = data.map((i) => Number(i.redeemCount) || 0);

          const maxValue = Math.max(...points);
          setAxisMax(maxValue > 0 ? maxValue * 1.25 : 10);

          setChartData({
            labels,
            datasets: [
              {
                label: "แต้มที่แลก (คะแนน)",
                data: points,
                backgroundColor: "rgba(13, 110, 253, 0.7)",   // ฟ้าน้ำเงิน
                borderColor: "rgba(13, 110, 253, 1)",
                borderWidth: 1,
                // เก็บ counts ไว้ใช้ใน tooltip
                _redeemCounts: counts,
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (err) {
        console.error("Error fetching top point redeemers:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPointRedeemers();
  }, [dateRange]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 12, bottom: 12, left: 8 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.x || 0;
            const ds = ctx.chart?.data?.datasets?.[ctx.datasetIndex];
            const count = ds?._redeemCounts?.[ctx.dataIndex] ?? 0;
            const valFmt = new Intl.NumberFormat("th-TH").format(val);
            const countFmt = new Intl.NumberFormat("th-TH").format(count);
            return [
              `แต้มรวมที่แลก: ${valFmt} แต้ม`,
              `จำนวนครั้ง: ${countFmt} ครั้ง`,
            ];
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#555",
        font: { weight: "bold", size: 11 },
        formatter: (value) =>
          `${new Intl.NumberFormat("th-TH", {
            notation: "compact",
            compactDisplay: "short",
          }).format(value)} แต้ม`,
        clamp: true,
        clip: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        suggestedMax: axisMax,
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          // ตัดให้ไม่ยาวเกินพื้นที่
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 16 ? label.slice(0, 16) + "…" : label;
          },
        },
      },
    },
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-danger text-center d-flex align-items-center justify-content-center h-100">
          {error}
        </div>
      );
    }
    if (!chartData) {
      return (
        <div className="text-muted text-center d-flex align-items-center justify-content-center h-100">
          ยังไม่มีข้อมูล
        </div>
      );
    }
    return <Bar options={options} data={chartData} />;
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column pb-3">
        <Card.Title as="h6">5 อันดับลูกค้าที่แลกแต้มมากที่สุด</Card.Title>
        <div className="flex-grow-1" style={{ position: "relative", minHeight: 200 }}>
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopPointRedeemersChart;
