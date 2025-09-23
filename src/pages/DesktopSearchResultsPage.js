// src/pages/DesktopSearchResultsPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import './DesktopSearchResultsPage.css';

const DesktopSearchResultsPage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        if (!query) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`https://api.souvenir-from-lagoon-thailand.com/api/products/search?q=${query}`);
                setSearchResults(response.data);
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการค้นหาสินค้า');
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <Container className="my-4 search-results-container">
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>กำลังค้นหา...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <h2 className="mb-4">
                        ผลการค้นหาสำหรับ: <span className="query-text">"{query}"</span>
                    </h2>
                    {searchResults.length > 0 ? (
                        <Row xs={1} md={2} lg={4} className="g-4">
                            {searchResults.map((product) => (
                                <Col key={product.product_id}>
                                    <Card as={Link} to={`/product/${product.product_id}`} className="product-card h-100">
                                        <Card.Img variant="top" src={product.image_url} className="product-card-img"/>
                                        <Card.Body>
                                            <Card.Title className="product-card-title">{product.name}</Card.Title>
                                            <Card.Text className="product-card-price">
                                                {product.price.toLocaleString()} บาท
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Alert variant="info">ไม่พบสินค้าที่ตรงกับการค้นหาของคุณ</Alert>
                    )}
                </>
            )}
        </Container>
    );
};

export default DesktopSearchResultsPage;