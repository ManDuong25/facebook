import { api } from './api';
import axios from 'axios';
import { getAvatarUrl } from '../utils/avatarUtils';

// Lấy thông tin profile
export const getProfile = async (userId) => {
    try {
        if (!userId) {
            throw new Error('userId is required');
        }

        const response = await api.get(`/api/users/${userId}`);

        // Lấy dữ liệu User từ API
        const userData = response.data?.data;

        if (!userData) {
            return null;
        }

        // Chuyển đổi dữ liệu User từ backend sang dạng Profile cần thiết
        return {
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Người dùng',
            email: userData.email || 'user@example.com',
            bio: userData.bio || 'Chưa có thông tin giới thiệu',
            dob: userData.dateOfBirth || '',
            gender: userData.gender || '',
            work: userData.work || 'Chưa cập nhật',
            education: userData.education || 'Chưa cập nhật',
            location: userData.currentCity || 'Chưa cập nhật',
            hometown: userData.hometown || 'Chưa cập nhật',
            userId: userData.id,
            id: userData.id,
            avatar: userData.avatar, // Trả về đường dẫn gốc, để getAvatarUrl xử lý
            coverPhotoUrl: userData.coverPhoto, // Trả về đường dẫn gốc, để getAvatarUrl xử lý
            username: userData.username,
            createdAt: userData.createdAt,
        };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

// Cập nhật thông tin profile
export const updateProfile = async (userId, profileData) => {
    try {
        if (!userId || !profileData) {
            throw new Error('userId and profileData are required');
        }

        let firstName = '';
        let lastName = '';
        if (profileData.name) {
            const nameParts = profileData.name.trim().split(' ');
            if (nameParts.length > 1) {
                lastName = nameParts[0];
                firstName = nameParts.slice(1).join(' ');
            } else {
                firstName = profileData.name.trim();
            }
        }

        const userData = {
            firstName,
            lastName,
            email: profileData.email,
            bio: profileData.bio,
            dateOfBirth: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : null,
            gender: profileData.gender,
            work: profileData.work,
            education: profileData.education,
            currentCity: profileData.location,
            hometown: profileData.hometown,
        };

        const response = await api.put(`/api/users/${userId}`, userData);
        return response.data?.data
            ? {
                  name: `${response.data.data.firstName || ''} ${response.data.data.lastName || ''}`.trim(),
                  email: response.data.data.email,
                  bio: response.data.data.bio,
                  dob: response.data.data.dateOfBirth,
                  gender: response.data.data.gender,
                  work: response.data.data.work,
                  education: response.data.data.education,
                  location: response.data.data.currentCity,
                  hometown: response.data.data.hometown,
                  userId: response.data.data.id,
                  avatar: response.data.data.avatar,
                  username: response.data.data.username,
                  createdAt: response.data.data.createdAt,
              }
            : null;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Upload ảnh đại diện
export const uploadAvatar = async (userId, avatarFile) => {
    try {
        if (!userId || !avatarFile) {
            throw new Error('userId and avatarFile are required');
        }

        // Đảm bảo userId là số
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
            throw new Error('userId must be a number');
        }

        // Tạo FormData để upload file
        const formData = new FormData();
        formData.append('userId', numericUserId);
        formData.append('avatar', avatarFile);

        // Sử dụng fetch thay vì axios để tránh lỗi
        const response = await fetch('http://localhost:8080/api/users/avatar', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
        }

        const responseData = await response.json();

        if (responseData && responseData.status === 'success') {
            // Trả về đường dẫn gốc, không xử lý
            return responseData.data;
        } else {
            throw new Error(responseData?.message || 'Failed to upload avatar');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};

// Upload ảnh bìa
export const uploadCoverPhoto = async (userId, coverFile) => {
    try {
        if (!userId || !coverFile) {
            throw new Error('userId and coverFile are required');
        }

        // Đảm bảo userId là số
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
            throw new Error('userId must be a number');
        }

        // Tạo FormData để upload file
        const formData = new FormData();
        formData.append('userId', numericUserId);
        formData.append('cover', coverFile);

        // Sử dụng fetch thay vì axios để tránh lỗi
        const response = await fetch('http://localhost:8080/api/users/cover', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
        }

        const responseData = await response.json();

        if (responseData && responseData.status === 'success') {
            // Trả về đường dẫn gốc, không xử lý
            return responseData.data;
        } else {
            throw new Error(responseData?.message || 'Failed to upload cover photo');
        }
    } catch (error) {
        console.error('Error uploading cover photo:', error);
        throw error;
    }
};
