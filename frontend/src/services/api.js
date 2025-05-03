import axios from 'axios';

// Tạo instance của axios với baseURL
export const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log đầy đủ thông tin lỗi để debug
        console.error('=== API ERROR DETAILS ===');
        console.error('- Endpoint:', error.config?.url);
        console.error('- Method:', error.config?.method?.toUpperCase());
        console.error('- Status:', error.response?.status, error.response?.statusText);
        console.error('- Response data:', error.response?.data);
        console.error('- Request data:', error.config?.data);
        console.error('- Request params:', error.config?.params);
        console.error('- Error message:', error.message);
        console.error('========================');

        // Báo lỗi để người dùng xem trong console và để frontend xử lý
        return Promise.reject(error);
    },
);

// Hàm tạo bài viết mới
export const createPost = async (content, file, userId) => {
    try {
        if (!content && !file) {
            throw new Error('Content or file is required to create a post');
        }
        const formData = new FormData();
        formData.append('content', content || '');
        formData.append('userId', userId || '');
        if (file) formData.append('file', file);
        const response = await api.post('/api/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create post:', error);
        return null;
    }
};

// Hàm lấy danh sách bài viết
export const getAllPosts = async () => {
    try {
        const response = await api.get('/api/posts');

        // Kiểm tra cấu trúc dữ liệu trả về từ API

        // Kiểm tra xem response có đúng định dạng không
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Nếu API trả về định dạng { status, message, data } thì lấy data
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            // Nếu API trả về trực tiếp mảng dữ liệu
            return response.data;
        } else {
            console.error('[API] Unexpected posts data format:', response.data);
            return [];
        }
    } catch (error) {
        console.error('[API] Failed to fetch posts:', error);
        // Log chi tiết lỗi
        if (error.response) {
            console.error('[API] Error response data:', error.response.data);
            console.error('[API] Error status:', error.response.status);
        }
        return [];
    }
};

// Hàm lấy bài viết của một người dùng cụ thể
export const getPostsByUser = async (userId) => {
    if (!userId) return [];

    try {
        const response = await api.get(`/api/posts/user/${userId}`);

        // Kiểm tra cấu trúc dữ liệu trả về từ API

        // Kiểm tra xem response có đúng định dạng không
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Nếu API trả về định dạng { status, message, data } thì lấy data
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            // Nếu API trả về trực tiếp mảng dữ liệu
            return response.data;
        } else {
            console.error(`[API] Unexpected posts data format for user ${userId}:`, response.data);
            return [];
        }
    } catch (error) {
        console.error(`[API] Failed to fetch posts for user ${userId}:`, error);
        // Log chi tiết lỗi
        if (error.response) {
            console.error('[API] Error response data:', error.response.data);
            console.error('[API] Error status:', error.response.status);
        }
        return [];
    }
};

// Hàm lấy bài viết đã chia sẻ của một người dùng
export const getSharedPostsByUser = async (userId) => {
    if (!userId) return [];

    try {
        const response = await api.get(`/api/posts/user/${userId}/shares`);
        return response.data || [];
    } catch (error) {
        console.error(`Failed to fetch shared posts for user ${userId}:`, error);
        return [];
    }
};

// Hàm lấy trạng thái "thích" và số lượt thích
export const getLikeStatus = async (postId, userId) => {
    if (!postId) return { liked: false, count: 0 };

    try {
        // Lấy danh sách like của bài viết
        const response = await api.get('/api/likes', {
            params: { postId },
        });

        // Kiểm tra xem user hiện tại đã like chưa và đếm số lượng like
        const likes = Array.isArray(response.data) ? response.data : [];
        const userLiked = userId ? likes.some((like) => like.user && like.user.id === userId) : false;

        return {
            liked: userLiked,
            count: likes.length,
        };
    } catch (error) {
        console.error('Error fetching like status:', error);
        return { liked: false, count: 0 };
    }
};

// Hàm thích bài viết
export const likePost = async (postId, userId) => {
    if (!postId || !userId) return null;

    try {
        const response = await api.post('/api/likes', null, {
            params: { postId, userId },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to like post:', error);
        return null;
    }
};

// Hàm bỏ thích bài viết
export const unlikePost = async (postId, userId) => {
    if (!postId || !userId) return null;

    try {
        const response = await api.delete('/api/likes', {
            params: { postId, userId },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to unlike post:', error);
        return null;
    }
};

// Hàm lấy danh sách bình luận
export const getComments = async (postId) => {
    if (!postId) return [];

    try {
        const response = await api.get('/api/comments', {
            params: { postId },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        return [];
    }
};

// Hàm thêm bình luận
export const addComment = async (postId, userId, content) => {
    if (!postId || !userId || !content) return null;

    try {
        // Backend đang sử dụng @RequestParam nên cần gửi dưới dạng query params
        const response = await api.post('/api/comments', null, {
            params: {
                postId,
                userId,
                content,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        return null;
    }
};

// Hàm chỉnh sửa bình luận
export const updateComment = async (commentId, content) => {
    if (!commentId || !content) return null;

    try {
        const response = await api.put(`/api/comments/${commentId}`, { content });
        return response.data;
    } catch (error) {
        console.error('Error updating comment:', error);
        return null;
    }
};

// Hàm xóa bình luận
export const deleteComment = async (commentId) => {
    if (!commentId) return false;

    try {
        await api.delete(`/api/comments/${commentId}`);
        return true;
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return false;
    }
};

// Hàm chia sẻ bài viết
export const sharePost = async (postId, userId) => {
    if (!postId || !userId) return null;

    try {
        // Chuẩn bị object cho Share theo format của backend controller
        const shareData = {
            post: { id: postId },
            user: { id: userId },
        };

        const response = await api.post('/api/shares', shareData);
        return response.data;
    } catch (error) {
        console.error('Failed to share post:', error);
        return null;
    }
};

// Hàm lấy danh sách lượt chia sẻ
export const getShares = async (postId) => {
    if (!postId) return [];

    try {
        const response = await api.get(`/api/shares/post/${postId}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching shares:', error);
        return [];
    }
};
