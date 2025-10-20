import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner, Container } from "react-bootstrap";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAllowed = allowedRoles.includes(user.role);

  return isAllowed ? <Outlet /> : <Navigate to="/index" replace />;
};

export default RoleProtectedRoute;
