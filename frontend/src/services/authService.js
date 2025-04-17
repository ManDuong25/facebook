import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Đăng ký tài khoản mới
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
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
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });

        // Lưu token và thông tin user vào localStorage
        if (response.data) {
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Có thể thêm redirect về trang login
    window.location.href = '/login';
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
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    return token !== null && user !== null;
};

// Lấy token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Kiểm tra token có hết hạn không
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};
