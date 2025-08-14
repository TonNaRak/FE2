import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Spinner, Container } from "react-bootstrap";

// Layouts & Protectors
import AdminLayout from "./components/AdminLayout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import CustomerLayout from "./components/CustomerLayout";


const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <Spinner animation="border" variant="primary" />
  </div>
);

// Lazy Loading
// Public Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./components/LoginForm"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

// Customer Pages
const IndexPage = lazy(() => import("./pages/IndexPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PaymentConfirmationPage = lazy(() =>
  import("./pages/PaymentConfirmationPage")
);
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));

// Admin Pages
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const ProductManagementPage = lazy(() =>
  import("./pages/admin/ProductManagementPage")
);
const StoreSettingPage = lazy(() => import("./pages/admin/StoreSettingPage"));
const OrderManagementPage = lazy(() =>
  import("./pages/admin/OrderManagementPage")
);
const RoleManagementPage = lazy(() =>
  import("./pages/admin/RoleManagementPage")
);
const CategoryManagementPage = lazy(() =>
  import("./pages/admin/CategoryManagementPage")
);


function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
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
              <Route
                path="/product/:productId"
                element={<ProductDetailPage />}
              />
              <Route path="/profile/edit" element={<EditProfilePage />} />
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
