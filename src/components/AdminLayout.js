import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                {/* <Outlet> คือที่ๆ React Router จะแสดงผล component ของแต่ละหน้าในโซน Admin */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;