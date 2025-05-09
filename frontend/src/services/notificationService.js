import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

// Lấy danh sách thông báo của người dùng
export const getNotifications = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/notifications/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách thông báo');
    }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadNotificationCount = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/notifications/user/${userId}/unread/count`);
        return response.data;
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy số lượng thông báo chưa đọc');
    }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error(error.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc');
    }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const response = await axios.put(`${API_URL}/notifications/user/${userId}/read-all`);
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error(error.response?.data?.message || 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
};

// Xóa một thông báo
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(`${API_URL}/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa thông báo');
    }
};

// Xóa tất cả thông báo của người dùng
export const deleteAllNotifications = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/notifications/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa tất cả thông báo');
    }
};
