// Dịch vụ chatbot sử dụng Google Gemini API và lưu trữ lịch sử trên backend
import axios from 'axios';
import { getCurrentUser } from './authService';

/**
 * Loại bỏ các ký tự markdown khỏi văn bản
 * @param {string} text - Văn bản cần xử lý
 * @returns {string} - Văn bản đã được xử lý
 */
const removeMarkdown = (text) => {
  if (!text) return '';

  try {
    // Loại bỏ dấu sao dùng cho in đậm và in nghiêng
    let cleaned = text.replace(/\*\*|\*/g, '');

    // Loại bỏ dấu gạch dưới dùng cho in nghiêng
    cleaned = cleaned.replace(/__|_/g, '');

    // Loại bỏ dấu backtick dùng cho code
    cleaned = cleaned.replace(/`/g, '');

    // Xử lý cẩn thận khoảng trắng để tránh vấn đề với tiếng Việt
    // Chỉ thay thế 2+ khoảng trắng liên tiếp thành 1 khoảng trắng
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ').trim();

    return cleaned;
  } catch (error) {
    console.error('Error in removeMarkdown:', error);
    // Nếu có lỗi xảy ra trong quá trình xử lý, trả về văn bản gốc
    return text;
  }
};

// API cho backend
const BACKEND_API_URL = 'http://localhost:8080/api/chatbot';

/**
 * Gửi tin nhắn đến backend API và nhận phản hồi từ chatbot
 * @param {string} message - Tin nhắn từ người dùng
 * @returns {Promise<string>} - Phản hồi từ chatbot
 */
export const sendMessage = async (message) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('Bạn cần đăng nhập để sử dụng chatbot');
    }

    // Gọi API backend
    const response = await axios.post(
      BACKEND_API_URL, // Sử dụng URL gốc đã định nghĩa
      {
        userId: currentUser.id,
        query: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Xử lý phản hồi từ backend
    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.response) {
      // Loại bỏ markdown trước khi trả về
      const cleanedResponse = removeMarkdown(response.data.data.response);
      console.log('Original response:', response.data.data.response);
      console.log('Cleaned response:', cleanedResponse);
      return cleanedResponse;
    } else {
      console.error('Unexpected API response structure from backend:', response.data);
      return 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này do cấu trúc phản hồi không mong muốn.';
    }
  } catch (error) {
    console.error('Error in sendMessage (backend API):', error);

    // Xử lý lỗi SOURCE_LANG_VI
    if (error && error.error === 'SOURCE_LANG_VI') {
      console.log('Đã bắt được lỗi SOURCE_LANG_VI');
      return 'Xin lỗi, hiện tại hệ thống đang gặp vấn đề khi xử lý tiếng Việt. Vui lòng thử lại sau.';
    }

    // Xử lý lỗi từ response
    if (error.response && error.response.data && error.response.data.message) {
      return `Lỗi từ server: ${error.response.data.message}`;
    }

    return 'Xin lỗi, đã xảy ra lỗi khi kết nối với dịch vụ AI qua backend. Vui lòng thử lại sau.';
  }
};

/**
 * Lấy lịch sử trò chuyện của người dùng hiện tại
 * @returns {Promise<Array>} - Danh sách tin nhắn
 */
export const getChatHistory = async () => {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('Bạn cần đăng nhập để xem lịch sử trò chuyện');
    }

    // Gọi API backend
    const response = await axios.get(`${BACKEND_API_URL}/history/${currentUser.id}`);

    // Kiểm tra phản hồi
    if (response.data && response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Xóa lịch sử trò chuyện
 * @returns {Promise} - Promise cho biết thao tác đã hoàn thành
 */
export const clearChatHistory = async () => {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('Bạn cần đăng nhập để xóa lịch sử trò chuyện');
    }

    // Gọi API backend
    const response = await axios.delete(`${BACKEND_API_URL}/history/${currentUser.id}`);

    // Kiểm tra phản hồi
    if (response.data && response.data.status === 'success') {
      return { success: true, message: 'Lịch sử trò chuyện đã được xóa' };
    } else {
      console.error('Unexpected API response structure:', response.data);
      return { success: false, message: 'Không thể xóa lịch sử trò chuyện' };
    }
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa lịch sử trò chuyện'
    };
  }
};
