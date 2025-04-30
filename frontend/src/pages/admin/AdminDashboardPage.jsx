import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDashboardStats, setLoading, setError } from '../../redux/features/adminSlice';
import { getDashboardStats, getActivityStats, getRecentActivities } from '../../services/adminService';
import StatisticsCard from '../../components/Admin/Dashboard/StatisticsCard';
import ActivityChart from '../../components/Admin/Dashboard/ActivityChart';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.admin);

  // Dữ liệu mẫu cho biểu đồ hoạt động
  const activityData = [
    { label: 'Bài viết', value: 45 },
    { label: 'Bình luận', value: 120 },
    { label: 'Đăng ký', value: 25 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      dispatch(setLoading(true));
      try {
        // Trong môi trường thực tế, sẽ gọi API để lấy dữ liệu
        // const response = await getDashboardStats();
        // dispatch(setDashboardStats(response.data));

        // Dùng dữ liệu mẫu cho demo
        const mockStats = {
          totalUsers: 1250,
          totalPosts: 3456,
          totalComments: 12890,
          recentActivity: activityData
        };

        dispatch(setDashboardStats(mockStats));
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        dispatch(setError(error.message || 'Không thể lấy dữ liệu thống kê'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStats();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        <StatisticsCard
          title="Tổng số người dùng"
          value={dashboardStats?.totalUsers || 0}
          icon="bi-people-fill"
          color="bg-blue-500"
        />
        <StatisticsCard
          title="Tổng số bài viết"
          value={dashboardStats?.totalPosts || 0}
          icon="bi-file-post-fill"
          color="bg-green-500"
        />
        <StatisticsCard
          title="Tổng số bình luận"
          value={dashboardStats?.totalComments || 0}
          icon="bi-chat-fill"
          color="bg-yellow-500"
        />
      </div>

      {/* Biểu đồ hoạt động */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart data={activityData} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <i className="bi bi-person-fill text-blue-500"></i>
              </div>
              <div>
                <p className="text-sm">Người dùng mới đăng ký: <span className="font-medium">Nguyễn Văn A</span></p>
                <p className="text-xs text-gray-500">2 giờ trước</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <i className="bi bi-file-post text-green-500"></i>
              </div>
              <div>
                <p className="text-sm">Bài viết mới: <span className="font-medium">Chuyến du lịch Đà Lạt</span></p>
                <p className="text-xs text-gray-500">5 giờ trước</p>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
