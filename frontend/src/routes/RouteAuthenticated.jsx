import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RouteAuthenticated = ({ component: Component, layout: Layout }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Nếu đã đăng nhập, hiển thị component với layout
  return Layout ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Component />
  );
};

export default RouteAuthenticated;
