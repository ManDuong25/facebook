package backend.backend.service;

import backend.backend.model.ChatbotMessage;
import backend.backend.model.User;
import backend.backend.repository.ChatbotMessageRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ChatbotService {

    @Autowired
    private ChatbotMessageRepository chatbotMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Lưu tin nhắn chatbot
     * @param userId ID của người dùng
     * @param content Nội dung tin nhắn
     * @param isBot Có phải tin nhắn từ bot không
     * @return Tin nhắn đã lưu
     */
    public ChatbotMessage saveMessage(Long userId, String content, Boolean isBot) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        
        ChatbotMessage message = new ChatbotMessage(userOpt.get(), content, isBot);
        return chatbotMessageRepository.save(message);
    }
    
    /**
     * Lấy lịch sử tin nhắn của một người dùng
     * @param userId ID của người dùng
     * @return Danh sách tin nhắn
     */
    public List<ChatbotMessage> getChatHistory(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        return chatbotMessageRepository.findByUserOrderByTimestampAsc(userOpt.get());
    }
    
    /**
     * Lấy n tin nhắn gần nhất của một người dùng
     * @param userId ID của người dùng
     * @param limit Số lượng tin nhắn tối đa
     * @return Danh sách tin nhắn
     */
    public List<ChatbotMessage> getRecentMessages(Long userId, int limit) {
        return chatbotMessageRepository.findRecentMessagesByUserId(userId, limit);
    }
    
    /**
     * Xóa tất cả tin nhắn của một người dùng
     * @param userId ID của người dùng
     */
    @Transactional
    public void clearChatHistory(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            chatbotMessageRepository.deleteByUser(userOpt.get());
        }
    }
}
