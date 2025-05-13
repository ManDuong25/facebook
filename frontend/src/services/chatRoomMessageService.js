import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

// Gửi tin nhắn trong phòng chat
export const sendMessage = async (roomId, userId, content, messageType = 'TEXT') => {
    try {
        const response = await axios.post(`${API_URL}/chat-room-messages/rooms/${roomId}/users/${userId}`, null, {
            params: {
                content,
                messageType,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error(error.response?.data?.message || 'Không thể gửi tin nhắn');
    }
};

// Xóa tin nhắn
export const deleteMessage = async (messageId) => {
    try {
        await axios.delete(`${API_URL}/chat-room-messages/${messageId}`);
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa tin nhắn');
    }
};

// Lấy tất cả tin nhắn trong phòng chat
export const getRoomMessages = async (roomId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-messages/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching room messages:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy tin nhắn');
    }
};

// Lấy tin nhắn có phân trang
export const getRoomMessagesPaginated = async (roomId, page = 0, size = 20) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-messages/rooms/${roomId}/paginated`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated messages:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy tin nhắn');
    }
};

// Lấy tin nhắn của một người dùng
export const getUserMessages = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-messages/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user messages:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy tin nhắn của người dùng');
    }
};

// Lấy tin nhắn theo loại trong phòng chat
export const getRoomMessagesByType = async (roomId, messageType) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-messages/rooms/${roomId}/type/${messageType}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages by type:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy tin nhắn theo loại');
    }
};

// Lấy thông tin chi tiết của một tin nhắn
export const getMessageById = async (messageId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-messages/${messageId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching message details:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin tin nhắn');
    }
};

// Đánh dấu tin nhắn đã xóa
export const markMessageAsDeleted = async (messageId) => {
    try {
        await axios.put(`${API_URL}/chat-room-messages/${messageId}/mark-deleted`);
    } catch (error) {
        console.error('Error marking message as deleted:', error);
        throw new Error(error.response?.data?.message || 'Không thể đánh dấu tin nhắn đã xóa');
    }
};
