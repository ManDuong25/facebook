package backend.backend.service;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMessage;
import backend.backend.model.User;
import backend.backend.repository.ChatRoomMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ChatRoomMessageService {
    @Autowired
    private ChatRoomMessageRepository chatRoomMessageRepository;

    public ChatRoomMessage sendMessage(ChatRoom room, User sender, String content,
            ChatRoomMessage.MessageType messageType) {
        ChatRoomMessage message = new ChatRoomMessage();
        message.setRoom(room);
        message.setSender(sender);
        message.setContent(content);
        message.setMessageType(messageType);

        return chatRoomMessageRepository.save(message);
    }

    public void deleteMessage(Long messageId) {
        ChatRoomMessage message = chatRoomMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeleted(true);
        chatRoomMessageRepository.save(message);
    }

    public List<ChatRoomMessage> getRoomMessages(ChatRoom room) {
        return chatRoomMessageRepository.findByRoomAndIsDeletedFalseOrderByCreatedAtAsc(room);
    }

    public Page<ChatRoomMessage> getRoomMessagesPaginated(ChatRoom room, Pageable pageable) {
        return chatRoomMessageRepository.findByRoomOrderByCreatedAtDesc(room, pageable);
    }

    public List<ChatRoomMessage> getUserMessages(User sender) {
        return chatRoomMessageRepository.findBySender(sender);
    }

    public List<ChatRoomMessage> getRoomMessagesByType(ChatRoom room, ChatRoomMessage.MessageType messageType) {
        return chatRoomMessageRepository.findByRoomAndMessageType(room, messageType);
    }

    public ChatRoomMessage getMessageById(Long messageId) {
        return chatRoomMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public void markMessageAsDeleted(Long messageId) {
        ChatRoomMessage message = chatRoomMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeleted(true);
        chatRoomMessageRepository.save(message);
    }

    public ChatRoomMessage saveMessage(ChatRoomMessage message) {
        return chatRoomMessageRepository.save(message);
    }
}