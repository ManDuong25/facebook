import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAdminUser } from "../redux/features/adminSlice";
import { getCurrentAdmin } from "../services/adminService";

const RouteAdmin = ({ component: Component, layout: Layout }) => {
  const dispatch = useDispatch();
  const { adminUser, isAdminAuthenticated } = useSelector(state => state.admin);

  // Kiểm tra xem có thông tin admin trong localStorage không
  useEffect(() => {
    if (!isAdminAuthenticated) {
      const storedAdmin = getCurrentAdmin();
      if (storedAdmin) {
        dispatch(setAdminUser(storedAdmin));
      }
    }
  }, [dispatch, isAdminAuthenticated]);

  // Kiểm tra xem người dùng đã đăng nhập và có quyền admin không
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  // Nếu đã đăng nhập và có quyền admin, hiển thị component với layout
  return Layout ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Component />
  );
};

export default RouteAdmin;
