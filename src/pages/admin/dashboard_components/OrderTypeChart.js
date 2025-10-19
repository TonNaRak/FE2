import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { format } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const OrderTypeChart = ({ dateRange }) => {
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

        // 1) จำนวนออเดอร์ตามช่องทาง (ของเดิม)
        const summaryRes = await axios.get(
          'https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/order-summary',
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        // 2) ยอดขายตามช่องทาง (บาท) - ของใหม่
        const amountRes = await axios.get(
          'https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/sales-channel-amounts',
          { headers: { Authorization: `Bearer ${token}` }, params }
        );

        const summary = summaryRes.data || {};
        const onlineOrders = summary['ออนไลน์'] || 0;
        const inStoreOrders = summary['หน้าร้าน'] || 0;

        const amounts = amountRes.data || {};
        const onlineAmount = amounts['ออนไลน์'] || 0;
        const inStoreAmount = amounts['หน้าร้าน'] || 0;

        // โดนัท: จำนวนออเดอร์
        setCountData({
          labels: ['ออนไลน์', 'หน้าร้าน'],
          datasets: [{
            label: 'จำนวนออเดอร์',
            data: [onlineOrders, inStoreOrders],
            backgroundColor: ['rgba(54,162,235,0.8)', 'rgba(255,206,86,0.8)'],
            borderColor:   ['rgba(54,162,235,1)',   'rgba(255,206,86,1)'],
            borderWidth: 1,
          }],
        });

        // พาย: มูลค่า (บาท)
        setAmountData({
          labels: ['ออนไลน์', 'หน้าร้าน'],
          datasets: [{
            label: 'มูลค่า (บาท)',
            data: [onlineAmount, inStoreAmount],
            backgroundColor: ['rgba(54,162,235,0.55)', 'rgba(255,206,86,0.55)'],
            borderColor:   ['rgba(54,162,235,1)',      'rgba(255,206,86,1)'],
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

    fetchBoth();
  }, [dateRange]);

  // datalabel: อยู่กลางชิ้น + ไม่โดนตัด + เล็กลงเพื่อไม่ล้น
  const basePlugins = {
    legend: { display: false },
    datalabels: {
      anchor: 'center',
      align: 'center',
      clamp: true,
      clip: false,
      color: '#333',
      font: { size: 11, weight: '500' },
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
    aspectRatio: 1,            // 1:1 (วงกลม)
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

    const noCountData = !countData || countData.datasets[0].data.every(v => v === 0);
    const noAmountData = !amountData || amountData.datasets[0].data.every(v => v === 0);
    if (noCountData && noAmountData)
      return <p className="text-muted text-center">ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>;

    return (
      // แนวนอนเสมอ + ย่ออัตโนมัติ + ไม่ล้น
      <div className="d-flex align-items-stretch justify-content-center gap-3 w-100"
           style={{ flexWrap: 'nowrap'}}>
        {/* โดนัท: จำนวน */}
        <div style={{
          width: 'min(220px, 45%)',
          aspectRatio: '1 / 1',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <small className="text-muted d-block text-center mb-1">จำนวนออเดอร์</small>
          <div style={{ position: 'relative', width: '100%', height: 'auto', flex: 1 }}>
            {noCountData
              ? <div className="d-flex h-100 w-100 justify-content-center align-items-center text-muted">ไม่มีข้อมูล</div>
              : <Doughnut data={countData} options={{...chartOptions, cutout: '40%'}} />}
          </div>
        </div>

        {/* พาย: มูลค่า */}
        <div style={{
          width: 'min(220px, 45%)',
          aspectRatio: '1 / 1',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <small className="text-muted d-block text-center mb-1">ยอดขาย (บาท)</small>
          <div style={{ position: 'relative', width: '100%', height: 'auto', flex: 1 }}>
            {noAmountData
              ? <div className="d-flex h-100 w-100 justify-content-center align-items-center text-muted">ไม่มีข้อมูล</div>
              : <Pie data={amountData} options={chartOptions} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column pb-3">
        <Card.Title>สัดส่วนประเภทออเดอร์และยอดขายตามช่องทาง</Card.Title>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center w-100">
          {renderContent()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderTypeChart;
