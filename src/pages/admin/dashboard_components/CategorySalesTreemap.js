import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

// ลงทะเบียนส่วนประกอบที่จำเป็นทั้งหมด
ChartJS.register(Tooltip, Legend, TreemapController, TreemapElement, ChartDataLabels);

const CategorySalesTreemap = ({ dateRange }) => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSalesByCategory = async () => {
            setIsLoading(true);
            setError('');
            setChartData(null); 
            
            try {
                const token = localStorage.getItem('accessToken');
                const params = new URLSearchParams();
                if (dateRange?.from && dateRange?.to) {
                    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
                    params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
                }

                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/sales-by-category', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });
                
                const data = response.data;
                
                const chartColors = [
                    'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
                ];
                
                setChartData({
    datasets: [{
        label: 'ยอดขายตามหมวดหมู่',
        data: data,
        backgroundColor: (ctx) => {
            if (ctx.type !== 'data' || !ctx.raw) return 'transparent';
            return chartColors[ctx.dataIndex % chartColors.length];
        },
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1.5,
        spacing: 2,
        key: 'totalRevenue',
        groups: ['categoryName'],

        // **[แก้ไขตรงนี้]** รวมการแสดงผลทั้งหมดไว้ที่นี่ที่เดียว
        labels: {
            display: true,
            align: 'center',
            color: 'white',
            font: {
                weight: 'bold',
                size: 14
            },
            // formatter จะคืนค่าเป็น Array เพื่อแสดงผลหลายบรรทัด
            formatter: (ctx) => {
                if (!ctx.raw) return null;
                const total = ctx.chart.getDatasetMeta(0).total;

                // 1. ชื่อหมวดหมู่
                const categoryName = ctx.raw.g;

                // 2. ยอดขาย (จัดรูปแบบย่อ)
                const salesValue = new Intl.NumberFormat('th-TH', {
                    notation: 'compact',
                    compactDisplay: 'short'
                }).format(ctx.raw.v);
                
                // 3. เปอร์เซ็นต์ (ถ้าต้องการ)
                const percentage = total > 0 ? `(${(ctx.raw.v / total * 100).toFixed(0)}%)` : '';

                // คืนค่าเป็น Array แต่ละค่าจะอยู่คนละบรรทัด
                return [categoryName, salesValue, percentage];
            }
        },
        // **[ลบออก]** ไม่ต้องใช้ 'values' block แล้ว
        // values: { ... }

    }],
});
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลได้');
                console.error("API Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (dateRange) fetchSalesByCategory();
    }, [dateRange]);

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                 callbacks: {
                    title: (context) => context[0].raw.g,
                    label: (context) => {
                        const value = context.raw.v;
                        return ` ยอดขาย: ${value.toLocaleString('th-TH')} บาท`;
                    }
                }
            },
            // **[แก้ไข]** เราจะย้ายการตั้งค่า datalabels ไปไว้ใน 'datasets' แทน
            datalabels: {
                display: false, // ปิดการตั้งค่ากลางที่นี่
            },
        },
    };

    const renderContent = () => {
        if (isLoading) return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        if (error) return <p className="text-danger text-center">{error}</p>;
        if (!chartData || chartData.datasets[0].data.length === 0) {
            return <p className="text-muted text-center">ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>;
        }
        
        return <Chart type="treemap" options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>ยอดขายตามหมวดหมู่</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CategorySalesTreemap;