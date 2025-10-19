import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const OrderStatusChart = ({ dateRange }) => {
  const [countData, setCountData] = useState(null);
  const [amountData, setAmountData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoth = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const params = new URLSearchParams();
        if (dateRange?.from && dateRange?.to) {
          params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
          params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
        }

        const [summaryRes, amountsRes] = await Promise.all([
          axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/order-status-summary', {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }),
          axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/order-status-amounts', {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }).catch(() => ({ data: { successAmount: 0, cancelledAmount: 0 } })), // กันพังถ้ายังไม่ได้ทำ API ใหม่
        ]);

        const s = summaryRes.data || {};
        const successCount = s['สำเร็จ'] || 0;
        const cancelledCount = s['ยกเลิก'] || 0;

        const { successAmount = 0, cancelledAmount = 0 } = amountsRes.data || {};

        setCountData({
          labels: ['สำเร็จ', 'ยกเลิก'],
          datasets: [{
            label: 'จำนวนออเดอร์',
            data: [successCount, cancelledCount],
            backgroundColor: ['rgba(25,135,84,0.7)', 'rgba(220,53,69,0.7)'],
            borderColor: ['rgba(25,135,84,1)', 'rgba(220,53,69,1)'],
            borderWidth: 1,
          }],
        });

        setAmountData({
          labels: ['สำเร็จ', 'ยกเลิก'],
          datasets: [{
            label: 'มูลค่า (บาท)',
            data: [successAmount, cancelledAmount],
            backgroundColor: ['rgba(25,135,84,0.55)', 'rgba(220,53,69,0.55)'],
            borderColor: ['rgba(25,135,84,1)', 'rgba(220,53,69,1)'],
            borderWidth: 1,
          }],
        });
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลกราฟได้');
      } finally {
        setIsLoading(false);
      }
    };

    if (dateRange) fetchBoth();
  }, [dateRange]);

  // datalabels ให้อยู่กลางชิ้น + ไม่โดนตัด
  const basePlugins = {
    legend: { display: false },
    datalabels: {
      anchor: 'center',
      align: 'center',
      clamp: true,
      clip: false,
      color: '#333',
      font: { size: 11, weight: '500' }, // เล็กลง
      formatter: (value, ctx) => {
        if (!value) return null;
        const label = ctx.chart.data.labels[ctx.dataIndex];
        return `${label}\n(${Number(value).toLocaleString()})`;
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const label = ctx.label || '';
          const val = ctx.parsed || 0;
          return `${label}: ${val.toLocaleString()}`;
        },
      },
    },
  };

  // ให้กราฟย่อเข้า container และเป็นวงกลมเสมอ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,      // 1:1
    layout: { padding: { top: 8, right: 8, bottom: 24, left: 8 } },
    plugins: basePlugins,
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" />
        </div>
      );
    }
    if (error) return <p className="text-danger text-center">{error}</p>;
    if (!countData || !amountData) return null;

    const total = countData.datasets[0].data.reduce((a, b) => a + b, 0);
    if (total === 0) {
      return <p className="text-muted text-center">ไม่มีข้อมูลสถานะออเดอร์</p>;
    }

    return (
      <div
        // แนวนอนเสมอ
        className="d-flex align-items-stretch justify-content-center gap-3 w-100"
        style={{ flexWrap: 'nowrap'}}
      >
        {/* กราฟจำนวน (ซ้าย) */}
        <div
          style={{
            // ย่ออัตโนมัติ: ใช้ได้ทั้งเปอร์เซ็นต์การ์ด และเพดาน px
            width: 'min(220px, 45%)',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <small className="text-muted d-block text-center mb-1">จำนวนออเดอร์</small>
          <div style={{ position: 'relative', width: '100%', height: 'auto', flex: 1 }}>
            <Doughnut data={countData} options={{...chartOptions, cutout: '40%'}} />
          </div>
        </div>

        {/* กราฟมูลค่า (ขวา) */}
        <div
          style={{
            width: 'min(220px, 45%)',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <small className="text-muted d-block text-center mb-1">มูลค่าออเดอร์ (บาท)</small>
          <div style={{ position: 'relative', width: '100%', height: 'auto', flex: 1 }}>
            <Pie data={amountData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column pb-3">
        <Card.Title>สัดส่วนสถานะออเดอร์</Card.Title>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center w-100">
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderStatusChart;
