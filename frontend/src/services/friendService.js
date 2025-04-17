import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:8080/api';

// Lấy danh sách bạn bè của người dùng
export const getFriends = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/friends/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching friends:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bạn bè');
    }
};

// Lấy danh sách lời mời kết bạn đã nhận
export const getFriendRequests = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/friend-requests/received/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách lời mời kết bạn');
    }
};

// Lấy danh sách lời mời kết bạn đã gửi
export const getSentRequests = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/friend-requests/sent/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching sent requests:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách lời mời đã gửi');
    }
};

// Gửi lời mời kết bạn
export const sendFriendRequest = async (senderId, receiverId) => {
    try {
        const response = await axios.post(`${API_URL}/friend-requests`, null, {
            params: {
                senderId,
                receiverId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw new Error(error.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (requestId) => {
    const currentUserId = getCurrentUser()?.id;
    try {
        const response = await axios.post(
            `${API_URL}/friend-requests/${requestId}/accept?currentUserId=${currentUserId}`,
        );
        return response.data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw new Error(error.response?.data?.message || 'Không thể chấp nhận lời mời kết bạn');
    }
};

// Từ chối lời mời kết bạn
export const rejectFriendRequest = async (requestId) => {
    const currentUserId = getCurrentUser()?.id;
    try {
        const response = await axios.post(
            `${API_URL}/friend-requests/${requestId}/reject?currentUserId=${currentUserId}`,
        );
        return response.data;
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw new Error(error.response?.data?.message || 'Không thể từ chối lời mời kết bạn');
    }
};

// Hủy lời mời kết bạn đã gửi
export const cancelFriendRequest = async (requestId) => {
    try {
        const response = await axios.delete(`${API_URL}/friend-requests/${requestId}`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling friend request:', error);
        throw new Error(error.response?.data?.message || 'Không thể hủy lời mời kết bạn');
    }
};

// Hủy kết bạn
export const removeFriend = async (user1Id, user2Id) => {
    try {
        const response = await axios.delete(`${API_URL}/friends/${user1Id}/${user2Id}`);
        return response.data;
    } catch (error) {
        console.error('Error removing friend:', error);
        throw new Error(error.response?.data?.message || 'Không thể hủy kết bạn');
    }
};

// Kiểm tra trạng thái kết bạn giữa 2 người dùng
export const checkFriendshipStatus = async (user1Id, user2Id) => {
    try {
        const response = await axios.get(`${API_URL}/friend-requests/status`, {
            params: {
                user1Id,
                user2Id,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error checking friendship status:', error);
        throw new Error(error.response?.data?.message || 'Không thể kiểm tra trạng thái kết bạn');
    }
};

// Lấy danh sách gợi ý kết bạn
export const getFriendSuggestions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/friends/suggestions/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching friend suggestions:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy gợi ý kết bạn');
    }
};

// Tìm kiếm người dùng theo tên, username, hoặc email
export const searchUsers = async (searchTerm, excludeCurrentUser = true) => {
    try {
        console.log(`Frontend: Gửi yêu cầu tìm kiếm với từ khóa "${searchTerm}"`);
        const response = await axios.get(`${API_URL}/users/search`, {
            params: {
                searchTerm,
                excludeCurrentUser,
            },
        });

        console.log('Frontend: Raw response from API:', response);
        console.log('Frontend: Kết quả tìm kiếm data:', response.data);

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
            console.log('Frontend: Số lượng kết quả tìm kiếm:', response.data.data.length);

            // In thông tin chi tiết về từng người dùng
            response.data.data.forEach((user, index) => {
                console.log(`Frontend: User #${index + 1}:`, {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                });
            });

            return response.data.data;
        } else if (Array.isArray(response.data)) {
            console.log('Frontend: Response là mảng trực tiếp:', response.data.length);

            // In thông tin chi tiết về từng người dùng
            response.data.forEach((user, index) => {
                console.log(`Frontend: User #${index + 1}:`, {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                });
            });

            return response.data;
        } else {
            console.error('Frontend: Kết quả tìm kiếm không hợp lệ:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Frontend: Lỗi khi tìm kiếm người dùng:', error);
        if (error.response) {
            console.error('Frontend: Response data:', error.response.data);
            console.error('Frontend: Response status:', error.response.status);
        }
        throw new Error(error.response?.data?.message || 'Không thể tìm kiếm người dùng');
    }
};

// Kiểm tra trạng thái kết bạn với danh sách người dùng
export const checkFriendshipStatusBatch = async (userId, userIds) => {
    try {
        console.log('Frontend: Kiểm tra trạng thái bạn bè hàng loạt');
        console.log('Frontend: userId:', userId);
        console.log('Frontend: targetUserIds:', userIds);

        // Kiểm tra dữ liệu đầu vào
        if (!userId) {
            console.error('Frontend: userId không hợp lệ:', userId);
            throw new Error('userId không hợp lệ');
        }

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            console.error('Frontend: danh sách targetUserIds không hợp lệ:', userIds);
            return []; // Trả về mảng rỗng thay vì ném lỗi
        }

        const response = await axios.post(`${API_URL}/friends/status-batch`, {
            userId,
            targetUserIds: userIds,
        });

        console.log('Frontend: Response từ server:', response);

        // Xử lý các trường hợp phản hồi khác nhau
        let statusResults = [];

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
            console.log('Frontend: Trả về data từ ResponseObject');
            statusResults = response.data.data;
        } else if (Array.isArray(response.data)) {
            console.log('Frontend: Trả về data dạng mảng trực tiếp');
            statusResults = response.data;
        } else if (response.data && Array.isArray(response.data.result)) {
            console.log('Frontend: Trả về result từ response');
            statusResults = response.data.result;
        } else {
            console.error('Frontend: Kết quả kiểm tra trạng thái bạn bè không hợp lệ:', response.data);
            // Trả về mảng trống thay vì ném lỗi để UI vẫn hoạt động
            return [];
        }

        // Debug: Log chi tiết trạng thái
        console.log('Frontend: Số lượng kết quả trạng thái bạn bè:', statusResults.length);
        statusResults.forEach((status) => {
            console.log(`Frontend: User ${status.targetUserId} có trạng thái: ${status.status}`);
        });

        // Đảm bảo tất cả userIds đều có trạng thái
        const completeResults = userIds.map((targetId) => {
            const existingStatus = statusResults.find((s) => s.targetUserId === targetId);
            if (existingStatus) {
                return existingStatus;
            } else {
                console.log(`Frontend: Không có trạng thái cho user ${targetId}, đặt mặc định là NONE`);
                return { targetUserId: targetId, status: 'NONE' };
            }
        });

        return completeResults;
    } catch (error) {
        console.error('Frontend: Lỗi khi kiểm tra trạng thái bạn bè hàng loạt:', error);
        if (error.response) {
            console.error('Frontend: Response data:', error.response.data);
            console.error('Frontend: Response status:', error.response.status);
        }
        // Trả về mảng trống thay vì ném lỗi để không làm hỏng UI
        return userIds.map((id) => ({ targetUserId: id, status: 'ERROR' }));
    }
};

export const getPendingRequestsReceived = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/friend-requests/pending-received/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách lời mời kết bạn đang pending');
    }
};

export const getMutualFriendIds = async (user1Id, user2Id) => {
    try {
        const response = await axios.get(`${API_URL}/friends/mutual?user1Id=${user1Id}&user2Id=${user2Id}`);
        return response;
    } catch (error) {
        console.error('Error get mutual friend ids:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy id của các bạn chung');
    }
};

export const getMutualFriendDetails = async (user1Id, user2Id) => {
    try {
        const response = await axios.get(`${API_URL}/friends/mutual/details?user1Id=${user1Id}&user2Id=${user2Id}`);
        return response;
    } catch (error) {
        console.error('Error get mutual friend ids:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy id của các bạn chung');
    }
};

// Lấy requestId từ senderId và receiverId
export const findFriendRequestId = async (senderId, receiverId) => {
    try {
        const response = await axios.get(`${API_URL}/friend-requests/find`, {
            params: {
                senderId,
                receiverId,
            },
        });
        console.log('Response from findFriendRequestId:', response.data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error finding friend request:', error);
        throw new Error(error.response?.data?.message || 'Không thể tìm thấy lời mời kết bạn');
    }
};
