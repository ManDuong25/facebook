import images from '../assets/images';

/**
 * Hàm xử lý URL của avatar/ảnh
 * @param {string|null} url - URL của avatar/ảnh từ API
 * @param {string} defaultImage - Ảnh mặc định nếu URL không tồn tại
 * @returns {string} - URL đã được xử lý để hiển thị
 */
export const getImageUrl = (url, defaultImage = images.avatarJpg) => {
  console.log("[AVATAR_UTILS] getImageUrl input:", url);
  
  // Kiểm tra nếu url rỗng hoặc null/undefined, trả về ảnh mặc định
  if (!url) {
    console.log("[AVATAR_UTILS] Returning default image:", defaultImage);
    return defaultImage;
  }
  
  // Nếu là File object hoặc Blob
  if (url instanceof File || url instanceof Blob) {
    console.log("[AVATAR_UTILS] URL is File/Blob, creating object URL");
    return URL.createObjectURL(url);
  }
  
  // Nếu đã là URL đầy đủ thì không cần thêm baseURL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log("[AVATAR_UTILS] URL already has protocol, returning as is:", url);
    return url;
  }
  
  // Đảm bảo url bắt đầu bằng dấu '/'
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  console.log("[AVATAR_UTILS] Normalized URL:", normalizedUrl);
  
  // Dùng địa chỉ cố định thay vì biến môi trường
  const API_BASE_URL = 'http://localhost:8080';
  // Thêm baseURL cho đường dẫn relative
  const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
  console.log("[AVATAR_UTILS] Final URL from getImageUrl:", fullUrl);
  return fullUrl;
};

/**
 * Hàm xử lý lỗi khi tải ảnh
 * @param {Event} event - Event onError của thẻ img
 * @param {string} defaultImage - Ảnh mặc định để hiển thị khi lỗi
 */
export const handleImageError = (event, defaultImage = images.avatarJpg) => {
  console.log("[AVATAR_UTILS] Image error occurred for:", event.target.src);
  console.log("[AVATAR_UTILS] Setting default image:", defaultImage);
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
  console.log("[AVATAR_UTILS] getAvatarUrl input:", avatarPath);
  
  // Nếu không có đường dẫn, trả về ảnh mặc định
  if (!avatarPath) {
    console.log("[AVATAR_UTILS] No avatar path, returning default:", defaultAvatar);
    return defaultAvatar;
  }
  
  // Phát hiện và bỏ qua giá trị cứng "avatar1.png" từ dữ liệu mẫu
  if (avatarPath === "avatar1.png" || avatarPath === "/avatar1.png") {
    console.log("[AVATAR_UTILS] Detected hardcoded avatar1.png, returning default image");
    return defaultAvatar;
  }
  
  // Profile đang dùng phương pháp này và nó hoạt động
  // Đồng nhất xử lý: dùng getImageUrl cho mọi trường hợp
  const result = getImageUrl(avatarPath, defaultAvatar);
  console.log("[AVATAR_UTILS] getAvatarUrl result:", result);
  return result;
};

/**
 * Tạo URL cho ảnh bìa từ cover path
 * @param {string|null} coverPath - Đường dẫn cover từ API
 * @param {string} defaultCover - Ảnh bìa mặc định
 * @returns {string} - URL đã được xử lý
 */
export const getCoverUrl = (coverPath, defaultCover = images.defaultCover) => {
  console.log("[AVATAR_UTILS] getCoverUrl input:", coverPath);
  const result = getImageUrl(coverPath, defaultCover);
  console.log("[AVATAR_UTILS] getCoverUrl result:", result);
  return result;
}; 