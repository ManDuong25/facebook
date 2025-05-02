// Dịch vụ chatbot sử dụng Google Gemini API và lưu trữ lịch sử trên backend
import axios from 'axios';
import { getCurrentUser } from './authService';

// API cho Gemini
const GEMINI_API_KEY = 'AIzaSyAUS00zR71DB_aC5zAmQPSItV09l6zN2mA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// API cho backend
const BACKEND_API_URL = 'http://localhost:8080/api/chatbot';

/**
 * Gửi tin nhắn đến Gemini API và lưu lịch sử trên backend
 * @param {string} message - Tin nhắn từ người dùng
 * @param {Array} conversationHistory - Lịch sử trò chuyện (tùy chọn)
 * @returns {Promise<string>} - Phản hồi từ chatbot
 */
export const sendMessage = async (message, conversationHistory = []) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('Bạn cần đăng nhập để sử dụng chatbot');
    }

    // 1. Lưu tin nhắn của người dùng vào backend
    await saveUserMessage(currentUser.id, message);

    // 2. Gọi API Gemini để lấy phản hồi
    // Tạo nội dung cho request
    const requestBody = {
      contents: [{
        parts: [{
          text: buildPrompt(message, conversationHistory)
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
        topK: 40
      }
    };

    // Gọi API Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Xử lý phản hồi từ Gemini
    let botResponse = 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.';

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      if (response.data.candidates[0].content &&
          response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0]) {
        botResponse = response.data.candidates[0].content.parts[0].text;
      } else if (response.data.candidates[0].parts && response.data.candidates[0].parts[0]) {
        botResponse = response.data.candidates[0].parts[0].text;
      }
    }

    // 3. Lưu phản hồi của bot vào backend
    await saveBotMessage(currentUser.id, botResponse);

    return botResponse;
  } catch (error) {
    console.error('Error in sendMessage:', error);

    // Kiểm tra lỗi cụ thể từ API
    if (error.response && error.response.data) {
      console.error('API error details:', error.response.data);

      // Kiểm tra lỗi API key
      if (error.response.data.error &&
          (error.response.data.error.status === 'INVALID_ARGUMENT' ||
           error.response.data.error.status === 'PERMISSION_DENIED' ||
           error.response.data.error.status === 'UNAUTHENTICATED')) {
        return 'Lỗi xác thực API key. Vui lòng kiểm tra lại API key của bạn.';
      }

      // Kiểm tra lỗi quá giới hạn
      if (error.response.data.error && error.response.data.error.status === 'RESOURCE_EXHAUSTED') {
        return 'Đã vượt quá giới hạn API. Vui lòng thử lại sau.';
      }
    }

    return 'Xin lỗi, đã xảy ra lỗi khi kết nối với dịch vụ AI. Vui lòng thử lại sau.';
  }
};

/**
 * Lưu tin nhắn người dùng vào backend
 * @param {number} userId - ID của người dùng
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise} - Promise cho biết thao tác đã hoàn thành
 */
const saveUserMessage = async (userId, message) => {
  try {
    await axios.post(
      `${BACKEND_API_URL}/save-user-message`,
      {
        userId: userId,
        message: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error saving user message:', error);
    return false;
  }
};

/**
 * Lưu tin nhắn bot vào backend
 * @param {number} userId - ID của người dùng
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise} - Promise cho biết thao tác đã hoàn thành
 */
const saveBotMessage = async (userId, message) => {
  try {
    await axios.post(
      `${BACKEND_API_URL}/save-bot-message`,
      {
        userId: userId,
        message: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error saving bot message:', error);
    return false;
  }
};

/**
 * Xây dựng prompt từ tin nhắn và lịch sử trò chuyện
 * @param {string} message - Tin nhắn hiện tại
 * @param {Array} history - Lịch sử trò chuyện
 * @returns {string} - Prompt hoàn chỉnh
 */
function buildPrompt(message, history) {
  // Tạo hướng dẫn hệ thống
  let systemPrompt = `Bạn là trợ lý AI trong ứng dụng Facebook Clone.
Hãy trả lời ngắn gọn, hữu ích và thân thiện.
Bạn có thể giúp người dùng tìm hiểu về các tính năng của ứng dụng, cách sử dụng, và trả lời các câu hỏi thường gặp.
Giữ câu trả lời ngắn gọn, dưới 3 câu.
Trả lời bằng tiếng Việt.`;

  // Thêm lịch sử trò chuyện nếu có
  let historyText = '';
  if (history && history.length > 0) {
    // Chỉ lấy tối đa 10 tin nhắn gần nhất để tránh vượt quá giới hạn token
    const recentHistory = history.slice(-10);

    historyText = '\n\nLịch sử trò chuyện:\n';
    recentHistory.forEach(msg => {
      const role = msg.sender === 'user' ? 'Người dùng' : 'Trợ lý';
      historyText += `${role}: ${msg.text}\n`;
    });
  }

  // Thêm tin nhắn hiện tại
  const currentMessage = `\n\nNgười dùng hiện tại hỏi: ${message}`;

  // Kết hợp tất cả
  return systemPrompt + historyText + currentMessage;
}

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
