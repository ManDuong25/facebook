package backend.backend.controller;

import backend.backend.dto.ChatbotMessageRequest;
import backend.backend.dto.ChatbotMessageResponse;
import backend.backend.model.ChatbotMessage;
import backend.backend.model.ResponseObject;
import backend.backend.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    /**
     * Lưu tin nhắn người dùng vào cơ sở dữ liệu
     */
    @PostMapping("/save-user-message")
    public ResponseEntity<ResponseObject> saveUserMessage(@RequestBody ChatbotMessageRequest request) {
        try {
            // Lưu tin nhắn của người dùng
            ChatbotMessage userMessage = chatbotService.saveMessage(
                request.getUserId(),
                request.getMessage(),
                false
            );

            return ResponseEntity.ok(new ResponseObject(
                "success",
                "User message saved successfully",
                new ChatbotMessageResponse(userMessage)
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("error", e.getMessage(), null));
        }
    }

    /**
     * Lưu tin nhắn bot vào cơ sở dữ liệu
     */
    @PostMapping("/save-bot-message")
    public ResponseEntity<ResponseObject> saveBotMessage(@RequestBody ChatbotMessageRequest request) {
        try {
            // Lưu phản hồi của bot
            ChatbotMessage botMessage = chatbotService.saveMessage(
                request.getUserId(),
                request.getMessage(),
                true
            );

            return ResponseEntity.ok(new ResponseObject(
                "success",
                "Bot message saved successfully",
                new ChatbotMessageResponse(botMessage)
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("error", e.getMessage(), null));
        }
    }

    /**
     * Lấy lịch sử trò chuyện của một người dùng
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<ResponseObject> getChatHistory(@PathVariable Long userId) {
        try {
            List<ChatbotMessage> messages = chatbotService.getChatHistory(userId);
            List<ChatbotMessageResponse> responses = messages.stream()
                .map(ChatbotMessageResponse::new)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ResponseObject(
                "success",
                "Chat history fetched successfully",
                responses
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("error", e.getMessage(), null));
        }
    }

    /**
     * Xóa lịch sử trò chuyện của một người dùng
     */
    @DeleteMapping("/history/{userId}")
    public ResponseEntity<ResponseObject> clearChatHistory(@PathVariable Long userId) {
        try {
            chatbotService.clearChatHistory(userId);
            return ResponseEntity.ok(new ResponseObject(
                "success",
                "Chat history cleared successfully",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("error", e.getMessage(), null));
        }
    }


}
