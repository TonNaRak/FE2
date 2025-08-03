import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layouts & Protectors
import AdminLayout from "./components/AdminLayout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import CustomerLayout from "./components/CustomerLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./components/LoginForm";
import RegisterPage from "./pages/RegisterPage";

// Customer Pages
import IndexPage from "./pages/IndexPage";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import LocationPage from "./pages/LocationPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import StoreSettingPage from "./pages/admin/StoreSettingPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import RoleManagementPage from "./pages/admin/RoleManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/index" element={<IndexPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
            <Route
              path="/payment-confirmation/:orderId"
              element={<PaymentConfirmationPage />}
            />
          </Route>

          {/* Admin & Employee Protected Routes */}
          <Route
            element={
              <RoleProtectedRoute allowedRoles={["admin", "employee"]} />
            }
          >
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route
                path="/admin/products"
                element={<ProductManagementPage />}
              />
              <Route path="/admin/orders" element={<OrderManagementPage />} />
              <Route
                path="/admin/store-settings"
                element={<StoreSettingPage />}
              />
              <Route path="/admin/roles" element={<RoleManagementPage />} />
              <Route
                path="/admin/categories"
                element={<CategoryManagementPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
