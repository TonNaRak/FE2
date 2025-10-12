import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const OrderStatusChart = ({ dateRange }) => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatusSummary = async () => {
            setIsLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('accessToken');
                const params = new URLSearchParams();
                if (dateRange?.from && dateRange?.to) {
                    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
                    params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
                }

                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/order-status-summary', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });

                const summary = response.data;
                const successOrders = summary['สำเร็จ'] || 0;
                const cancelledOrders = summary['ยกเลิก'] || 0;

                setChartData({
                    labels: ['สำเร็จ', 'ยกเลิก'],
                    datasets: [
                        {
                            label: 'จำนวนออเดอร์',
                            data: [successOrders, cancelledOrders],
                            backgroundColor: [
                                'rgba(25, 135, 84, 0.7)', // สีเขียว (สำเร็จ)
                                'rgba(220, 53, 69, 0.7)',  // สีแดง (ยกเลิก)
                            ],
                            borderColor: [
                                'rgba(25, 135, 84, 1)',
                                'rgba(220, 53, 69, 1)',
                            ],
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

        if (dateRange) {
            fetchStatusSummary();
        }

    }, [dateRange]);

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
                font: { size: 14 },
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
        if (!chartData || (chartData.datasets[0].data.reduce((a, b) => a + b, 0) === 0)) {
            return <p className="text-muted text-center">ไม่มีข้อมูลสถานะออเดอร์</p>;
        }
        return <Doughnut options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>สัดส่วนสถานะออเดอร์</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default OrderStatusChart;