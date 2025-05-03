import images from '../assets/images';

/**
 * Hàm xử lý URL của avatar/ảnh
 * @param {string|null} url - URL của avatar/ảnh từ API
 * @param {string} defaultImage - Ảnh mặc định nếu URL không tồn tại
 * @returns {string} - URL đã được xử lý để hiển thị
 */
export const getImageUrl = (url, defaultImage = images.avatarJpg) => {
    // Kiểm tra nếu url rỗng hoặc null/undefined, trả về ảnh mặc định
    if (!url) {
        return defaultImage;
    }

    // Nếu là File object hoặc Blob
    if (url instanceof File || url instanceof Blob) {
        return URL.createObjectURL(url);
    }

    // Nếu đã là URL đầy đủ thì không cần thêm baseURL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Đảm bảo url bắt đầu bằng dấu '/'
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    // Dùng địa chỉ cố định thay vì biến môi trường
    const API_BASE_URL = 'http://localhost:8080';
    // Thêm baseURL cho đường dẫn relative
    const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
    return fullUrl;
};

/**
 * Hàm xử lý lỗi khi tải ảnh
 * @param {Event} event - Event onError của thẻ img
 * @param {string} defaultImage - Ảnh mặc định để hiển thị khi lỗi
 */
export const handleImageError = (event, defaultImage = images.avatarJpg) => {
    event.target.src = defaultImage;
    // Dừng sự kiện để không có vòng lặp vô hạn nếu hình mặc định cũng lỗi
    event.onerror = null;
};

/**
 * Tạo URL cho ảnh đại diện từ avatar path
 * @param {string|null} avatarPath - Đường dẫn avatar từ API
 * @param {string} defaultAvatar - Ảnh đại diện mặc định
 * @returns {string} - URL đã được xử lý
 */
export const getAvatarUrl = (avatarPath, defaultAvatar = images.avatarJpg) => {
    // Nếu không có đường dẫn, trả về ảnh mặc định
    if (!avatarPath) {
        return defaultAvatar;
    }

    // Phát hiện và bỏ qua giá trị cứng "avatar1.png" từ dữ liệu mẫu
    if (avatarPath === 'avatar1.png' || avatarPath === '/avatar1.png') {
        return defaultAvatar;
    }

    // Profile đang dùng phương pháp này và nó hoạt động
    // Đồng nhất xử lý: dùng getImageUrl cho mọi trường hợp
    const result = getImageUrl(avatarPath, defaultAvatar);
    return result;
};

/**
 * Tạo URL cho ảnh bìa từ cover path
 * @param {string|null} coverPath - Đường dẫn cover từ API
 * @param {string} defaultCover - Ảnh bìa mặc định
 * @returns {string} - URL đã được xử lý
 */
export const getCoverUrl = (coverPath, defaultCover = images.defaultCover) => {
    const result = getImageUrl(coverPath, defaultCover);
    return result;
};
