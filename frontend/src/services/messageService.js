import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

export const getMessagesOfUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/conversations/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages of user:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy đoạn hội thoại của người dùng!');
    }
};

export const sendMessage = async (senderId, receiverId, message) => {
    try {
        const response = await axios.post(`${API_URL}/messages/send`, {
            senderId,
            receiverId,
            message,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error(error.response?.data?.message || 'Không thể gửi tin nhắn!');
    }
};

export const getMessagesBetweenUsers = async (user1Id, user2Id) => {
    try {
        const response = await axios.get(`${API_URL}/messages/${user1Id}/${user2Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages between users:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy tin nhắn giữa hai người dùng!');
    }
};
