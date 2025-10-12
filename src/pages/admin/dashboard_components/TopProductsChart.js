import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const TopProductsChart = ({ dateRange, selectedCategory }) => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [axisMax, setAxisMax] = useState(null); // State ใหม่สำหรับเก็บค่าสูงสุดของแกน

    useEffect(() => {
        const fetchTopProducts = async () => {
            setIsLoading(true);
            setError('');
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

                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/top-products', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });
                
                const data = response.data;
                const labels = data.map(item => item.productName);
                const quantities = data.map(item => item.totalQuantity);

                // --- [ เพิ่มใหม่ ] --- คำนวณค่าสูงสุดของแกนเพื่อเว้นที่ให้ Label ---
                if (quantities.length > 0) {
                    const maxValue = Math.max(...quantities);
                    // เพิ่มพื้นที่ไปอีก 25% จากค่าสูงสุด
                    setAxisMax(Math.ceil(maxValue * 1.25));
                } else {
                    setAxisMax(10); // กำหนดค่าพื้นฐานถ้าไม่มีข้อมูล
                }
                // --- [ จบส่วนที่เพิ่มใหม่ ] ------------------------------------

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'จำนวน (ชิ้น)',
                            data: quantities,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
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
            fetchTopProducts();
        }

    }, [dateRange, selectedCategory]);

    // --- [ START: ส่วนที่แก้ไข ] ---
    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                right: 20, // เพิ่ม padding ด้านขวาเผื่อไว้
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#555',
                font: {
                    weight: 'bold',
                },
                formatter: (value) => `${value}`, // แสดงแค่ตัวเลข
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false, // เอาเส้น Grid แนวนอนออก
                },
                suggestedMax: axisMax, // กำหนดค่าสูงสุดของแกนแบบไดนามิก
                ticks: {
                    display: false, // ซ่อนตัวเลขแกน X เพราะมี Data Label แล้ว
                }
            },
            y: {
                ticks: {
                    // ตัดข้อความที่ยาวเกินไป
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        if (label.length > 35) {
                            return label.substring(0, 35) + '...';
                        }
                        return label;
                    }
                },
                grid: {
                    display: false, // เอาเส้น Grid แนวตั้งออกด้วยเพื่อให้สะอาดขึ้น
                }
            }
        },
    };
    // --- [ END: ส่วนที่แก้ไข ] ---

    const renderContent = () => {
        if (isLoading) {
            return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        }
        if (error) {
            return <p className="text-danger text-center">{error}</p>;
        }
        if (!chartData || chartData.datasets[0].data.length === 0) {
            return <p className="text-muted text-center">ไม่มีข้อมูลสินค้าขายดีสำหรับช่วงเวลานี้</p>;
        }
        return <Bar options={options} data={chartData} />;
    }

    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>5 อันดับสินค้าขายดี (ตามจำนวน)</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default TopProductsChart;