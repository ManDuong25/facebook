// src/redux/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getCurrentUser } from '../../services/authService';
import images from '../../assets/images'; // Sửa: Dùng default import

// Lấy thông tin người dùng từ localStorage
const storedUser = getCurrentUser();

// Hàm kiểm tra và sửa đường dẫn avatar nếu là avatar giả (avatar1.png, avatar2.png, ...)
const validateUserData = (userData) => {
    if (!userData) return null;

    // Tạo bản sao để không thay đổi dữ liệu gốc
    const user = { ...userData };

    // Kiểm tra và sửa avatar nếu là avatar giả (avatar1.png, avatar2.png, ...)
    if (
        user.avatar &&
        (user.avatar === 'avatar1.png' ||
            user.avatar === 'avatar2.png' ||
            user.avatar === 'avatar3.png' ||
            user.avatar === 'avatar4.png' ||
            user.avatar === '/avatar1.png' ||
            user.avatar === '/avatar2.png' ||
            user.avatar === '/avatar3.png' ||
            user.avatar === '/avatar4.png')
    ) {
        user.avatar = null; // Để dùng ảnh mặc định
    }

    return user;
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: validateUserData(storedUser) || null,
        isAuthenticated: !!storedUser,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = validateUserData(action.payload);
            state.isAuthenticated = true;

            // Cập nhật localStorage khi setUser
            if (state.user) {
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateUser: (state, action) => {
            // Cập nhật thông tin user và kiểm tra avatar
            state.user = validateUserData({ ...state.user, ...action.payload });

            // Cập nhật localStorage
            if (state.user) {
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user'); // Xóa dữ liệu localStorage khi đăng xuất
        },
    },
});

export const { setUser, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
