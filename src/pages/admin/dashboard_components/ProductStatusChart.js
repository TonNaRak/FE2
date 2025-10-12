import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ProductStatusChart = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatusSummary = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/product-status-summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const summary = response.data;
                const activeProducts = summary['เปิดขาย'] || 0;
                const hiddenProducts = summary['ซ่อน'] || 0;

                setChartData({
                    labels: ['เปิดขาย', 'ซ่อน'],
                    datasets: [
                        {
                            label: 'จำนวนสินค้า',
                            data: [activeProducts, hiddenProducts],
                            backgroundColor: [
                                'rgba(25, 135, 84, 0.7)',  // สีเขียว
                                'rgba(108, 117, 125, 0.7)', // สีเทา
                            ],
                            borderColor: [
                                'rgba(25, 135, 84, 1)',
                                'rgba(108, 117, 125, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });

            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatusSummary();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'end',
                offset: 8,
                color: '#555',
                font: { size: 14, weight: 'bold' },
                // --- [ START: ส่วนที่แก้ไข ] ---
                formatter: (value, context) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    if (value === 0) return null;
                    // แสดงแค่ ชื่อ (จำนวน)
                    return `${label} (${value})`;
                },
                // --- [ END: ส่วนที่แก้ไข ] ---
            },
        },
    };

    const renderContent = () => {
        if (isLoading) return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        if (error) return <p className="text-danger text-center">{error}</p>;
        if (!chartData || (chartData.datasets[0].data.reduce((a, b) => a + b, 0) === 0)) {
            return <p className="text-muted text-center">ไม่มีข้อมูลสถานะสินค้า</p>;
        }
        return <Doughnut options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>สัดส่วนสถานะสินค้า</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductStatusChart;
