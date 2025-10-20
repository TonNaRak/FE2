import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Spinner } from "react-bootstrap";

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
const PointHistoryPage = lazy(() => import("./pages/PointHistoryPage"));
const DesktopSearchResultsPage = lazy(() =>
  import("./pages/DesktopSearchResultsPage")
);

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
const POSPage = lazy(() => import("./pages/admin/POSPage"));
const DashboardOverviewPage = lazy(() =>
  import("./pages/admin/DashboardOverviewPage")
);
const DashboardProductsPage = lazy(() =>
  import("./pages/admin/DashboardProductsPage")
);
const DashboardCustomersPage = lazy(() =>
  import("./pages/admin/DashboardCustomersPage")
);
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const DailyReportPage = lazy(() => import("./pages/admin/DailyReportPage"));
const MonthlyReportPage = lazy(() => import("./pages/admin/MonthlyReportPage"));
const YearlyReportPage = lazy(() => import("./pages/admin/YearlyReportPage"));

// Component สำหรับจัดการหน้าแรก
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "employee") {
      return <Navigate to="/admin/pos" replace />;
    }
    return <Navigate to="/index" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/index" element={<IndexPage />} />
              <Route path="/results" element={<DesktopSearchResultsPage />} />
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
              <Route path="/points-history" element={<PointHistoryPage />} />
              <Route
                path="/payment-confirmation/:orderId"
                element={<PaymentConfirmationPage />}
              />
            </Route>

            {/* --- Admin & Employee Protected Routes --- */}
            <Route
              element={
                <RoleProtectedRoute allowedRoles={["admin", "employee"]} />
              }
            >
              <Route element={<AdminLayout />}>
                <Route
                  element={<RoleProtectedRoute allowedRoles={["admin"]} />}
                >
                  <Route path="/admin/dashboard" element={<DashboardPage />}>
                    <Route index element={<DashboardOverviewPage />} />
                    <Route
                      path="products"
                      element={<DashboardProductsPage />}
                    />
                    <Route
                      path="customers"
                      element={<DashboardCustomersPage />}
                    />
                  </Route>{" "}
                  <Route path="/admin/reports" element={<ReportsPage />}>
                    <Route index element={<DailyReportPage />} />
                    <Route path="monthly" element={<MonthlyReportPage />} />
                    <Route path="yearly" element={<YearlyReportPage />} />
                  </Route>
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

                <Route path="/admin/pos" element={<POSPage />} />
                <Route
                  path="/admin/products"
                  element={<ProductManagementPage />}
                />
                <Route path="/admin/orders" element={<OrderManagementPage />} />
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
