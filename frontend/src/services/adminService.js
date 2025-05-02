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
    console.log(`Gọi API lấy danh sách người dùng: ${API_URL}/users với page=${page}, size=${size}`);
    const response = await axios.get(`${API_URL}/users`, {
      params: { page, size }
    });
    console.log('Kết quả API lấy danh sách người dùng:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách người dùng');
  }
};

// Tìm kiếm người dùng theo tên, username hoặc email
export const searchUsers = async (searchTerm, excludeCurrentUser = false) => {
  try {
    console.log(`Gọi API tìm kiếm người dùng với từ khóa: ${searchTerm}`);
    const response = await axios.get(`http://localhost:8080/api/users/search`, {
      params: { searchTerm, excludeCurrentUser }
    });
    console.log('Kết quả API tìm kiếm người dùng:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm người dùng:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể tìm kiếm người dùng');
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
export const toggleUserStatus = async (userId, isBlocked) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/status`, { isBlocked });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể thay đổi trạng thái người dùng');
  }
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    console.log('Gửi dữ liệu tạo người dùng mới:', userData);
    const response = await axios.post(`${API_URL}/users`, userData);
    console.log('Kết quả API tạo người dùng:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo người dùng mới:', error.response?.data || error);

    // Xử lý các lỗi cụ thể
    if (error.response?.data?.message) {
      // Nếu server trả về thông báo lỗi cụ thể
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 400) {
      // Lỗi dữ liệu không hợp lệ
      throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
    } else if (error.response?.status === 409) {
      // Lỗi xung đột (ví dụ: username hoặc email đã tồn tại)
      throw new Error('Username hoặc email đã tồn tại trong hệ thống.');
    } else if (error.response?.status === 500) {
      // Lỗi server
      throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else {
      // Lỗi khác
      throw new Error('Không thể tạo người dùng mới. Vui lòng thử lại.');
    }
  }
};

// ==================== QUẢN LÝ BÀI VIẾT ====================

// Lấy danh sách bài viết có phân trang và tìm kiếm
export const getAllPosts = async (page = 0, size = 10, searchTerm = '', userId = null, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    console.log(`Gọi API lấy danh sách bài viết: ${API_URL}/posts`);
    const params = { page, size, sortBy, sortDir };

    if (searchTerm) params.searchTerm = searchTerm;
    if (userId) params.userId = userId;

    const response = await axios.get(`${API_URL}/posts`, { params });
    console.log('Kết quả API lấy danh sách bài viết:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bài viết');
  }
};

// Lấy chi tiết bài viết
export const getPostDetails = async (postId) => {
  try {
    console.log(`Gọi API lấy chi tiết bài viết: ${API_URL}/posts/${postId}`);
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    console.log('Kết quả API lấy chi tiết bài viết:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết bài viết:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết bài viết');
  }
};

// Cập nhật trạng thái hiển thị bài viết (ẩn/hiện)
export const updatePostVisibility = async (postId, visible) => {
  try {
    console.log(`Gọi API cập nhật trạng thái bài viết: ${API_URL}/posts/${postId}/visibility`);
    const response = await axios.put(`${API_URL}/posts/${postId}/visibility`, { visible });
    console.log('Kết quả API cập nhật trạng thái bài viết:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bài viết:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái bài viết');
  }
};

// Xóa bài viết (xóa mềm)
export const deletePost = async (postId) => {
  try {
    console.log(`Gọi API xóa bài viết: ${API_URL}/posts/${postId}`);
    const response = await axios.delete(`${API_URL}/posts/${postId}`);
    console.log('Kết quả API xóa bài viết:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể xóa bài viết');
  }
};

// Lấy danh sách người dùng cho dropdown
export const getUsersForDropdown = async () => {
  try {
    console.log(`Gọi API lấy danh sách người dùng cho dropdown: ${API_URL}/users/list`);
    const response = await axios.get(`${API_URL}/users/list`);
    console.log('Kết quả API lấy danh sách người dùng cho dropdown:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng cho dropdown:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách người dùng');
  }
};

// Lấy số lượng like của bài viết
export const getPostLikes = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/likes/count`, {
      params: { postId }
    });
    console.log('API likes/count response:', response.data);
    return response.data.count || 0;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng like:', error);
    return 0;
  }
};

// Lấy số lượng comment của bài viết
export const getPostComments = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/comments/count`, {
      params: { postId }
    });
    return response.data.count || 0;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng comment:', error);
    return 0;
  }
};

// Lấy số lượng share của bài viết
export const getPostShares = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/shares/count/${postId}`);
    console.log('API shares/count response:', response.data);
    return response.data.count || 0;
  } catch (error) {
    console.error('Lỗi khi lấy số lượng share:', error);
    return 0;
  }
};

// Lấy thông tin chi tiết của người dùng
export const getUserDetail = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/detail`);
    console.log('API response (user detail):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user detail:', error);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin chi tiết người dùng');
  }
};
