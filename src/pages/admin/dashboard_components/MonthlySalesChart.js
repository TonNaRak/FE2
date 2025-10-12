import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const MonthlySalesChart = ({ dateRange }) => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlySales = async () => { // เปลี่ยนชื่อฟังก์ชันกลับ
            setIsLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('accessToken');
                const params = new URLSearchParams();
                if (dateRange?.from && dateRange?.to) {
                    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
                    params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
                }

                // --- [ แก้ไขตรงนี้ ] ---
                // เรียก API เส้นใหม่สำหรับข้อมูลรายเดือน
                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/monthly-sales', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });
                
                const data = response.data;
                
                // เปลี่ยนการจัดรูปแบบ Label ให้เป็นรายเดือน
                const labels = data.map(item => format(parseISO(item.month), 'MMM yyyy', { locale: th }));
                const salesData = data.map(item => item.totalSales);
                // --- [ จบส่วนที่แก้ไข ] ---

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'ยอดขาย',
                            data: salesData,
                            fill: true,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            tension: 0.3,
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
            fetchMonthlySales(); // เรียกฟังก์ชันที่เปลี่ยนชื่อแล้ว
        }

    }, [dateRange]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                display: 'auto',
                anchor: 'end',
                align: 'top',
                color: '#36A2EB',
                font: {
                    weight: 'bold',
                },
                formatter: (value) => {
                    if (value > 0) {
                        return new Intl.NumberFormat('th-TH', {
                            notation: 'compact',
                            compactDisplay: 'short',
                        }).format(value);
                    }
                    return null;
                },
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 4,
                padding: 4,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('th-TH', {
                            notation: 'compact',
                            compactDisplay: 'short',
                        }).format(value);
                    }
                }
            }
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        }
        if (error) {
            return <p className="text-danger text-center">{error}</p>;
        }
        if (!chartData || chartData.datasets[0].data.length === 0) {
            return <p className="text-muted text-center">ไม่มีข้อมูลยอดขายสำหรับช่วงเวลานี้</p>;
        }
        return <Line options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                {/* --- [ แก้ไขตรงนี้ ] --- */}
                <Card.Title>ยอดขายรายเดือน</Card.Title> 
                {/* --- [ จบส่วนที่แก้ไข ] --- */}
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default MonthlySalesChart;
