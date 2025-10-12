import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const TopRevenueProductsChart = ({ dateRange, selectedCategory }) => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [axisMax, setAxisMax] = useState(null);

    useEffect(() => {
        const fetchTopRevenueProducts = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const params = new URLSearchParams();
                if (dateRange?.from && dateRange?.to) {
                    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
                    params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
                }

                if (selectedCategory) {
                    params.append('categoryName', selectedCategory);
                }

                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/top-revenue-products', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });

                const data = response.data;
                const labels = data.map(item => item.productName);
                const revenues = data.map(item => item.totalRevenue);

                if (revenues.length > 0) {
                    const maxValue = Math.max(...revenues);
                    setAxisMax(Math.ceil(maxValue * 1.25));
                } else {
                    setAxisMax(1000); // Default max value
                }

                setChartData({
                    labels,
                    datasets: [{
                        label: 'ยอดขาย (บาท)',
                        data: revenues,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    }],
                });
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลกราฟได้');
            } finally {
                setIsLoading(false);
            }
        };

        if (dateRange) {
            fetchTopRevenueProducts();
        }
    }, [dateRange, selectedCategory]);

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 10 } },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#555',
                font: { weight: 'bold' },
                formatter: (value) => {
                     return new Intl.NumberFormat('th-TH', {
                        style: 'currency',
                        currency: 'THB',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(value);
                }
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { display: false },
                suggestedMax: axisMax,
                ticks: { display: false }
            },
            y: {
                ticks: {
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return label.length > 25 ? label.substring(0, 25) + '...' : label;
                    }
                },
                grid: { display: false }
            }
        },
    };

    const renderContent = () => {
        if (isLoading) return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        if (error) return <p className="text-danger text-center">{error}</p>;
        if (!chartData || chartData.datasets[0].data.length === 0) return <p className="text-muted text-center">ไม่มีข้อมูลสำหรับช่วงเวลานี้</p>;
        return <Bar options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>5 อันดับสินค้าทำรายได้สูงสุด</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default TopRevenueProductsChart;