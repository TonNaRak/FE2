import React from 'react';
import ReactDOM from 'react-dom/client';

import "bootstrap/dist/css/bootstrap.min.css";

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Import สิ่งที่เราสร้างขึ้นมา
import './i18n'; // import เพื่อให้ i18next เริ่มทำงาน
import { AuthProvider } from './context/AuthContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. นำ AuthProvider มาครอบ App */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();