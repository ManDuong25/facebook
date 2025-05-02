import { createSlice } from '@reduxjs/toolkit';

// Hàm để lấy lịch sử trò chuyện từ localStorage
const getChatHistoryFromStorage = () => {
  try {
    const storedMessages = localStorage.getItem('chatbotMessages');
    if (storedMessages) {
      return JSON.parse(storedMessages);
    }
  } catch (error) {
    console.error('Error loading chat history from localStorage:', error);
  }

  // Trả về tin nhắn mặc định nếu không có lịch sử hoặc có lỗi
  return [
    {
      id: 1,
      text: 'Xin chào! Tôi là AI Assistant, tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }
  ];
};

// Hàm để lưu lịch sử trò chuyện vào localStorage
const saveChatHistoryToStorage = (messages) => {
  try {
    localStorage.setItem('chatbotMessages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

const initialState = {
  isOpen: false,
  messages: getChatHistoryFromStorage(),
  isTyping: false,
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      // Thêm tin nhắn mới vào state
      const newMessage = {
        id: state.messages.length + 1,
        text: action.payload.text,
        sender: action.payload.sender,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(newMessage);

      // Lưu lịch sử trò chuyện vào localStorage
      saveChatHistoryToStorage(state.messages);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      // Đặt lại tin nhắn về tin nhắn mặc định
      const defaultMessage = {
        id: 1,
        text: 'Xin chào! Tôi là AI Assistant, tôi có thể giúp gì cho bạn?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      state.messages = [defaultMessage];

      // Cập nhật localStorage
      saveChatHistoryToStorage(state.messages);
    },
    // Thêm action để tải lịch sử trò chuyện từ localStorage
    loadChatHistory: (state) => {
      const storedMessages = getChatHistoryFromStorage();
      state.messages = storedMessages;
    },
  },
});

export const { toggleChatbot, addMessage, setTyping, clearMessages, loadChatHistory } = chatbotSlice.actions;

export default chatbotSlice.reducer;
