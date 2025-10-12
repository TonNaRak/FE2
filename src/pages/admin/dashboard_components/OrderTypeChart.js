import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { format } from 'date-fns';

// Register Chart.js components and the datalabels plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// The component now accepts `dateRange` as a prop
const OrderTypeChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect will re-run whenever the `dateRange` prop changes
  useEffect(() => {
    const fetchOrderSummary = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');

        // Create URL parameters to send with the API request
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
          params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
        }

        const response = await axios.get(
          'https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/order-summary',
          {
            headers: { Authorization: `Bearer ${token}` },
            params, // Pass the date range parameters
          }
        );

        const summary = response.data;
        const onlineOrders = summary['ออนไลน์'] || 0;
        const inStoreOrders = summary['หน้าร้าน'] || 0;

        setChartData({
          labels: ['ออนไลน์', 'หน้าร้าน'],
          datasets: [
            {
              label: 'จำนวนออเดอร์',
              data: [onlineOrders, inStoreOrders],
              backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
              ],
              borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลกราฟได้');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderSummary();
  }, [dateRange]); // Dependency array ensures this runs when dateRange changes

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: 8,
        clamp: true,
        color: '#555',
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          if (value === 0) return null;
          return `${label} (${value})`;
        },
      },
    },
  };

  const renderContent = () => {
    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
    }
    if (error) {
        return <p className="text-danger text-center">{error}</p>;
    }
    if (!chartData || (chartData.datasets[0].data[0] === 0 && chartData.datasets[0].data[1] === 0)) {
        return <p className="text-muted text-center">ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>;
    }
    return <Doughnut data={chartData} options={options} />;
  }

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>สัดส่วนประเภทออเดอร์</Card.Title>
        <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
            {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderTypeChart;
