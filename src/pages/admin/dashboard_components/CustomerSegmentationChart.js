import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 1. นำเข้า datalabels กลับมา
import { Card, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

// 2. ลงทะเบียน datalabels กลับมาเหมือนเดิม
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, ChartDataLabels);

const CustomerSegmentationChart = ({ dateRange }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSegmentationData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('accessToken');
                const params = new URLSearchParams();
                if (dateRange?.from && dateRange?.to) {
                    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
                    params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
                }
                const response = await axios.get(
                    "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/customer-segmentation",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: params,
                    }
                );
                
                const { scatterData, averages } = response.data;
                
                if (scatterData.length > 0) {
                    setChartData({
                        datasets: [{
                            label: 'ลูกค้า',
                            data: scatterData,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }],
                        averages: averages,
                    });
                } else {
                    setChartData(null);
                }
            } catch (error) {
                console.error('Error fetching segmentation data:', error);
                setError('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSegmentationData();
    }, [dateRange]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const dataPoint = context.raw;
                        return `${dataPoint.username}: (${dataPoint.x} ครั้ง, ${dataPoint.y.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })})`;
                    },
                },
            },
            // 3. นำ datalabels กลับมาใส่ไว้เหมือนเดิม
            datalabels: {
                display: false,
            },
            annotation: {
                annotations: {
                    avgFreqLine: {
                        type: 'line',
                        xMin: chartData?.averages.avgFrequency,
                        xMax: chartData?.averages.avgFrequency,
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: 'เฉลี่ย (ครั้ง)',
                            display: false,
                            position: 'start',
                            font: { style: 'italic' }
                        }
                    },
                    avgMonetaryLine: {
                        type: 'line',
                        yMin: chartData?.averages.avgMonetary,
                        yMax: chartData?.averages.avgMonetary,
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: 'เฉลี่ย (บาท)',
                            display: false,
                            position: 'start',
                            font: { style: 'italic' }
                        }
                    },
                },
            },
        },
        scales: {
            y: {
                title: { display: true, text: 'ยอดสั่งซื้อรวม (บาท)' },
                beginAtZero: true,
            },
            x: {
                title: { display: true, text: 'จำนวนออเดอร์ (ครั้ง)' },
                beginAtZero: true,
            },
        },
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>;
        }
        if (error) {
            return <p className="text-danger text-center h-100 d-flex align-items-center justify-content-center">{error}</p>;
        }
        if (!chartData) {
            return <p className="text-muted text-center h-100 d-flex align-items-center justify-content-center">ข้อมูลไม่เพียงพอที่จะสร้างกราฟ</p>;
        }
        return <Scatter options={options} data={chartData} />;
    };
    
    return (
        <Card className="h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title as="h6">การแบ่งกลุ่มลูกค้า (ยอดซื้อ vs ความถี่)</Card.Title>
                <div className="flex-grow-1" style={{ position: 'relative', minHeight: '300px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CustomerSegmentationChart;