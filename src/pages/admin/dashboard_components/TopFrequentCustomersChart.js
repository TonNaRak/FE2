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

const TopFrequentCustomersChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [axisMax, setAxisMax] = useState(null);

  useEffect(() => {
    const fetchTopFrequentCustomers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
          params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
        }
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/top-frequent-customers",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: params,
          }
        );

        const data = response.data;
        if (data.length > 0) {
          const labels = data.map((item) => item.username);
          const orderCounts = data.map((item) => item.orderCount);

          const maxValue = Math.max(...orderCounts);
          setAxisMax(maxValue * 1.25);

          setChartData({
            labels: labels,
            datasets: [
              {
                label: "จำนวนออเดอร์",
                data: orderCounts,
                backgroundColor: "hsl(265, 60%, 55%)",
                borderColor: "hsl(265, 60%, 45%)",
                borderWidth: 1,
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error("Error fetching top frequent customers data:", error);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopFrequentCustomers();
  }, [dateRange]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `จำนวน: ${context.parsed.x.toLocaleString()} ครั้ง`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#555",
        font: { weight: "bold" },
        formatter: (value) => `${value.toLocaleString()} ครั้ง`,
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
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substring(0, 15) + "..." : label;
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
        <p className="text-danger text-center h-100 d-flex align-items-center justify-content-center">
          {error}
        </p>
      );
    }
    if (!chartData) {
      return (
        <p className="text-muted text-center h-100 d-flex align-items-center justify-content-center">
          ยังไม่มีข้อมูล
        </p>
      );
    }
    return <Bar options={options} data={chartData} />;
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h6">5 อันดับลูกค้าที่สั่งซื้อบ่อยที่สุด</Card.Title>
        <div
          className="flex-grow-1"
          style={{ position: "relative", minHeight: "200px" }}
        >
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopFrequentCustomersChart;
