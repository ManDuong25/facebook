import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

// Đăng nhập admin
export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });

    // Lưu thông tin admin vào localStorage nếu đăng nhập thành công
    if (response.data.status === 'success') {
      localStorage.setItem('adminUser', JSON.stringify(response.data.data));
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi đăng nhập');
  }
};

// Đăng xuất admin
export const adminLogout = () => {
  localStorage.removeItem('adminUser');
  return { success: true };
};

// Lấy thông tin admin hiện tại
export const getCurrentAdmin = () => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser ? JSON.parse(adminUser) : null;
};

// Tạo instance axios với headers chứa token
const getAuthAxios = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Lấy thống kê tổng quan
export const getDashboardStats = async () => {
  try {
    // Sử dụng axios với token
    const authAxios = getAuthAxios();
    const response = await authAxios.get(`/dashboard/stats`);

    console.log('API response (stats):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thống kê');
  }
};

// Lấy dữ liệu hoạt động gần đây (biểu đồ)
export const getActivityStats = async () => {
  try {
    // Sử dụng axios với token
    const authAxios = getAuthAxios();
    const response = await authAxios.get(`/dashboard/activity`);

    console.log('API response (activity):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy dữ liệu hoạt động');
  }
};



// Lấy danh sách người dùng có phân trang
export const getAllUsers = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách người dùng');
  }
};

// Lấy thông tin chi tiết của một người dùng
export const getUserDetails = async (userId) => {
  try {
    // Sử dụng API chung từ UserController
    const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin người dùng');
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể xóa người dùng');
  }
};

// Đặt lại mật khẩu cho người dùng
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/reset-password`, { newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
  }
};

// Thay đổi trạng thái người dùng (khóa/mở khóa)
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể thay đổi trạng thái người dùng');
  }
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tạo người dùng mới');
  }
};
