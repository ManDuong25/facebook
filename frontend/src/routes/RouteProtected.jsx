import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RouteProtected = ({ component: Component, layout: Layout }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  // Nếu đã đăng nhập, chuyển hướng đến trang chủ
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Nếu chưa đăng nhập, hiển thị component (đăng nhập/đăng ký)
  return Layout ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Component />
  );
};

export default RouteProtected; 