import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDashboardStats, setLoading, setError } from '../../redux/features/adminSlice';
import { getDashboardStats, getActivityStats } from '../../services/adminService';
import StatisticsCard from '../../components/Admin/Dashboard/StatisticsCard';
import ActivityChart from '../../components/Admin/Dashboard/ActivityChart';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.admin);

  // State để lưu dữ liệu hoạt động từ API
  const [activityData, setActivityData] = useState([
    { label: 'Bài viết', value: 0 },
    { label: 'Bình luận', value: 0 },
    { label: 'Đăng ký', value: 0 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      dispatch(setLoading(true));
      try {
        console.log('Đang gọi API lấy thống kê tổng quan...');

        // Lấy thống kê tổng quan từ API
        const statsResponse = await getDashboardStats();
        console.log('Kết quả API stats:', statsResponse);

        if (statsResponse.status === 'success') {
          // Cập nhật state với dữ liệu từ API
          dispatch(setDashboardStats(statsResponse.data));
          console.log('Đã cập nhật dữ liệu thống kê:', statsResponse.data);
        }

        // Lấy dữ liệu hoạt động trong 30 ngày qua từ API
        const activityResponse = await getActivityStats();
        console.log('Kết quả API activity:', activityResponse);

        if (activityResponse.status === 'success') {
          // Cập nhật dữ liệu hoạt động
          setActivityData(activityResponse.data);
          console.log('Đã cập nhật dữ liệu hoạt động:', activityResponse.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        dispatch(setError('Không thể lấy dữ liệu thống kê. Vui lòng kiểm tra kết nối.'));
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
      <div className="grid grid-cols-1 gap-6">
        <ActivityChart data={activityData} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
