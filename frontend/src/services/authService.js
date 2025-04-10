import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Đăng ký tài khoản mới
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Lỗi khi đăng ký tài khoản');
    }
    throw new Error('Lỗi kết nối đến máy chủ');
  }
};

// Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    // Lưu thông tin user vào localStorage
    if (response.data && response.data.id) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Email hoặc mật khẩu không chính xác');
    }
    throw new Error('Lỗi kết nối đến máy chủ');
  }
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('user');
};

// Lấy thông tin user từ localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
}; 