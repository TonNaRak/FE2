import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from 'react-bootstrap';

const CategorySlicer = ({ onCategoryChange, selectedCategory }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get('https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/all-categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        // ถ้าผู้ใช้เลือก "หมวดหมู่ทั้งหมด" ให้ส่งค่า null กลับไป
        onCategoryChange(value === "" ? null : value);
    };

    return (
        <Form.Group controlId="categorySlicer">
            <Form.Label className="fw-bold">เลือกหมวดหมู่</Form.Label>
            <Form.Select 
                onChange={handleChange} 
                value={selectedCategory || ""}
                disabled={isLoading}
            >
                <option value="">หมวดหมู่ทั้งหมด</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat.categoryName}>
                        {cat.categoryName}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default CategorySlicer;