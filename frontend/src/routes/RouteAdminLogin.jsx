import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RouteAdminLogin = ({ component: Component, layout: Layout }) => {
  const { isAdminAuthenticated } = useSelector(state => state.admin);
  
  // Nếu đã đăng nhập admin, chuyển hướng đến trang admin
  if (isAdminAuthenticated) {
    return <Navigate to="/admin" />;
  }
  
  // Nếu chưa đăng nhập admin, hiển thị trang đăng nhập admin
  return Layout ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Component />
  );
};

export default RouteAdminLogin;
