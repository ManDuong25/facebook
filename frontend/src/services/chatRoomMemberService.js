import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

// Thêm thành viên vào phòng chat
export const addMember = async (roomId, userId, role = 'MEMBER') => {
    try {
        const response = await axios.post(`${API_URL}/chat-room-members/rooms/${roomId}/users/${userId}`, null, {
            params: { role },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding member:', error);
        throw new Error(error.response?.data?.message || 'Không thể thêm thành viên vào phòng chat');
    }
};

// Xóa thành viên khỏi phòng chat
export const removeMember = async (memberId) => {
    try {
        const response = await axios.delete(`${API_URL}/chat-room-members/${memberId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing member:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa thành viên khỏi phòng chat');
    }
};

// Cập nhật vai trò thành viên
export const updateMemberRole = async (memberId, newRole) => {
    try {
        const response = await axios.put(`${API_URL}/chat-room-members/${memberId}/role`, null, {
            params: { newRole },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating member role:', error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật vai trò thành viên');
    }
};

// Lấy danh sách thành viên trong phòng chat
export const getRoomMembers = async (roomId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-members/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching room members:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách thành viên');
    }
};

// Lấy danh sách phòng chat của người dùng
export const getUserRooms = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-members/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user rooms:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng chat của người dùng');
    }
};

// Lấy danh sách admin của phòng chat
export const getRoomAdmins = async (roomId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-members/rooms/${roomId}/admins`);
        return response.data;
    } catch (error) {
        console.error('Error fetching room admins:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách admin');
    }
};

// Kiểm tra người dùng có phải là thành viên của phòng chat không
export const isMember = async (roomId, userId) => {
    try {
        const response = await axios.get(`${API_URL}/chat-room-members/check`, {
            params: { roomId, userId },
        });
        return response.data;
    } catch (error) {
        console.error('Error checking member status:', error);
        throw new Error(error.response?.data?.message || 'Không thể kiểm tra trạng thái thành viên');
    }
};

// Cập nhật thời gian hoạt động cuối cùng của thành viên
export const updateLastSeen = async (memberId) => {
    try {
        const response = await axios.put(`${API_URL}/chat-room-members/${memberId}/last-seen`);
        return response.data;
    } catch (error) {
        console.error('Error updating last seen:', error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật thời gian hoạt động');
    }
};
