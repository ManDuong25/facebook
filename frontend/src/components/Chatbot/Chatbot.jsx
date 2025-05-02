import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChatbot, addMessage, setTyping, clearMessages, loadChatHistory } from '../../redux/features/chatbotSlice';
import { sendMessage, clearChatHistory, getChatHistory } from '../../services/chatbotService';
import { getCurrentUser } from '../../services/authService';
import './Chatbot.css';

const Chatbot = () => {
  const dispatch = useDispatch();
  const { isOpen, messages, isTyping } = useSelector((state) => state.chatbot);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Tải lịch sử trò chuyện từ server khi component được tạo
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        // Lấy lịch sử trò chuyện từ server
        const history = await getChatHistory();

        // Chuyển đổi định dạng và cập nhật vào Redux store
        if (history && history.length > 0) {
          // Xóa tin nhắn hiện tại
          dispatch(clearMessages());

          // Thêm từng tin nhắn vào store
          history.forEach(msg => {
            dispatch(addMessage({
              text: msg.content,
              sender: msg.isBot ? 'bot' : 'user',
              timestamp: msg.timestamp
            }));
          });
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadHistory();
  }, [dispatch]);

  // Cuộn xuống tin nhắn mới nhất khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus vào input khi mở chatbot
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Thêm tin nhắn của người dùng vào state
    dispatch(addMessage({
      text: inputMessage,
      sender: 'user',
    }));

    // Xóa input
    setInputMessage('');

    // Hiển thị trạng thái đang nhập
    dispatch(setTyping(true));

    try {
      // Gọi API để lấy phản hồi, truyền lịch sử trò chuyện
      const response = await sendMessage(inputMessage, messages);

      // Thêm tin nhắn phản hồi từ bot
      dispatch(addMessage({
        text: response,
        sender: 'bot',
      }));
    } catch (error) {
      console.error('Error sending message:', error);

      // Thêm tin nhắn lỗi
      dispatch(addMessage({
        text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
        sender: 'bot',
      }));
    } finally {
      // Tắt trạng thái đang nhập
      dispatch(setTyping(false));
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Xử lý đóng/mở chatbot
  const handleToggleChatbot = () => {
    dispatch(toggleChatbot());
    setIsMinimized(false);
  };

  // Xử lý thu nhỏ/phóng to chatbot
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Xử lý xóa lịch sử trò chuyện
  const handleClearChat = async () => {
    try {
      const result = await clearChatHistory();
      if (result.success) {
        dispatch(clearMessages());
      } else {
        console.error('Failed to clear chat history:', result.message);
        // Thêm tin nhắn lỗi
        dispatch(addMessage({
          text: result.message || 'Không thể xóa lịch sử trò chuyện.',
          sender: 'bot',
        }));
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      // Thêm tin nhắn lỗi
      dispatch(addMessage({
        text: 'Đã xảy ra lỗi khi xóa lịch sử trò chuyện.',
        sender: 'bot',
      }));
    }
  };

  // Format thời gian
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Nút mở/đóng chatbot */}
      <button
        className="chatbot-toggle"
        onClick={handleToggleChatbot}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
      </button>

      {/* Container chatbot */}
      {isOpen && (
        <div className={`chatbot-container ${isMinimized ? 'chatbot-minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <div className="chatbot-header-actions">
              <button onClick={handleClearChat} title="Xóa lịch sử">
                <i className="bi bi-trash"></i>
              </button>
              <button onClick={handleMinimize} title={isMinimized ? "Mở rộng" : "Thu nhỏ"}>
                <i className={`bi ${isMinimized ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
              </button>
              <button onClick={handleToggleChatbot} title="Đóng">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                {message.text}
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}

            {/* Hiển thị trạng thái đang nhập */}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {/* Phần tử để cuộn xuống tin nhắn mới nhất */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input nhập tin nhắn */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              ref={inputRef}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              title="Gửi"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
