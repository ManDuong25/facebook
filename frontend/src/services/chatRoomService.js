import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

// Tạo phòng chat mới
export const createChatRoom = async (chatRoom) => {
    try {
        const response = await axios.post(`${API_URL}/chat-rooms`, chatRoom);
        return response.data;
    } catch (error) {
        console.error('Error creating chat room:', error);
        throw new Error(error.response?.data?.message || 'Không thể tạo phòng chat');
    }
};

// Cập nhật thông tin phòng chat
export const updateChatRoom = async (id, chatRoomDetails) => {
    try {
        const response = await axios.put(`${API_URL}/chat-rooms/${id}`, chatRoomDetails);
        return response.data;
    } catch (error) {
        console.error('Error updating chat room:', error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật phòng chat');
    }
};

// Xóa phòng chat
export const deleteChatRoom = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/chat-rooms/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting chat room:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa phòng chat');
    }
};

// Lấy thông tin phòng chat theo ID
export const getChatRoomById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/chat-rooms/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat room:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin phòng chat');
    }
};

// Lấy danh sách tất cả phòng chat
export const getAllChatRooms = async () => {
    try {
        const response = await axios.get(`${API_URL}/chat-rooms`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng chat');
    }
};

// Tìm kiếm phòng chat theo tên
export const searchChatRooms = async (name) => {
    try {
        const response = await axios.get(`${API_URL}/chat-rooms/search`, {
            params: { name },
        });
        return response.data;
    } catch (error) {
        console.error('Error searching chat rooms:', error);
        throw new Error(error.response?.data?.message || 'Không thể tìm kiếm phòng chat');
    }
};

// Kiểm tra tên phòng chat đã tồn tại chưa
export const checkRoomName = async (name) => {
    try {
        const response = await axios.get(`${API_URL}/chat-rooms/check-name`, {
            params: { name },
        });
        return response.data;
    } catch (error) {
        console.error('Error checking room name:', error);
        throw new Error(error.response?.data?.message || 'Không thể kiểm tra tên phòng chat');
    }
};

// Lấy danh sách phòng chat của user
export const getUserChatRooms = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-members/users/${userId}`);
        // Lấy thông tin chi tiết của từng phòng chat
        const rooms = await Promise.all(
            response.data.map(async (member) => {
                const roomDetails = await getChatRoomById(member.room.id);
                return {
                    ...roomDetails,
                    role: member.role,
                };
            }),
        );
        return rooms;
    } catch (error) {
        console.error('Error fetching user chat rooms:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng chat');
    }
};
