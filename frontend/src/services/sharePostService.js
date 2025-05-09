import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Lấy bài viết của người dùng và bạn bè
export const getUserFeed = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/posts/user/${userId}/feed`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user feed:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy bài viết');
    }
};
