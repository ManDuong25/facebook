import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../../../redux/features/adminSlice';
import { getUserDetail } from '../../../services/adminService';
import { getAvatarUrl, getCoverUrl, getImageUrl } from '../../../utils/avatarUtils';
import { toast } from 'react-toastify';

const UserDetail = ({ userId, onClose }) => {
  const dispatch = useDispatch();
  const [userDetail, setUserDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'additional', 'activity'

  useEffect(() => {
    const fetchUserDetail = async () => {
      dispatch(setLoading(true));
      try {
        const response = await getUserDetail(userId);
        if (response.status === 'success') {
          setUserDetail(response.data);
        } else {
          throw new Error(response.message || 'Không thể lấy thông tin chi tiết người dùng');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin chi tiết người dùng:', error);
        dispatch(setError(error.message));
        toast.error('Không thể lấy thông tin chi tiết người dùng');
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId, dispatch]);

  if (!userDetail) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Thông tin chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="relative">
        {/* Cover photo */}
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          {userDetail.coverPhoto ? (
            <img
              src={getCoverUrl(userDetail.coverPhoto)}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading cover photo:", e);
                e.target.onerror = null;
                e.target.src = ""; // Fallback to gradient background
                e.target.parentElement.classList.add("bg-gradient-to-r", "from-blue-400", "to-indigo-500");
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          )}
        </div>

        {/* Avatar and name */}
        <div className="absolute -bottom-16 left-6 flex items-end">
          <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
            <img
              src={getAvatarUrl(userDetail.avatar)}
              alt={userDetail.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading avatar:", e);
                e.target.onerror = null;
                // Sử dụng ảnh mặc định từ assets
                import('../../../assets/images/avatar.jpg').then(defaultAvatar => {
                  e.target.src = defaultAvatar.default;
                });
              }}
            />
          </div>
          <div className="ml-4 mb-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg">
            <h1 className="text-2xl font-bold">{userDetail.fullName}</h1>
            <p className="text-gray-600">@{userDetail.username}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-white"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Content with tabs */}
      <div className="mt-20 p-6">
        {/* Status badges */}
        <div className="flex gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            userDetail.isAdmin
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {userDetail.isAdmin ? 'Admin' : 'Người dùng'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            userDetail.isBlocked
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {userDetail.isBlocked ? 'Đã khóa' : 'Hoạt động'}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => setActiveTab('additional')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'additional'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin chi tiết
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hoạt động
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tên đăng nhập</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Họ và tên</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.fullName}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ngày sinh</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'Không có'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Giới tính</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.gender || 'Không có'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleDateString('vi-VN') : 'Không có'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {userDetail.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {activeTab === 'additional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tiểu sử</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.bio || 'Không có'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Công việc</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.work || 'Không có'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Học vấn</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.education || 'Không có'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nơi ở hiện tại</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.currentCity || 'Không có'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quê quán</h3>
                  <p className="mt-1 text-sm text-gray-900">{userDetail.hometown || 'Không có'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activity */}
          {activeTab === 'activity' && (
            <div>
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{userDetail.stats?.postCount || 0}</div>
                  <div className="text-sm text-gray-600">Bài viết</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{userDetail.stats?.commentCount || 0}</div>
                  <div className="text-sm text-gray-600">Bình luận</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{userDetail.stats?.friendCount || 0}</div>
                  <div className="text-sm text-gray-600">Bạn bè</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{userDetail.stats?.likeCount || 0}</div>
                  <div className="text-sm text-gray-600">Lượt thích</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{userDetail.stats?.shareCount || 0}</div>
                  <div className="text-sm text-gray-600">Chia sẻ</div>
                </div>
              </div>

              {/* Phần hiển thị bài viết gần đây đã được xóa */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
