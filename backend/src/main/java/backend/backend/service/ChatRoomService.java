package backend.backend.service;

import backend.backend.model.ChatRoom;
import backend.backend.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatRoomService {
    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public ChatRoom createChatRoom(ChatRoom chatRoom) {
        if (chatRoomRepository.existsByName(chatRoom.getName())) {
            throw new RuntimeException("Chat room name already exists");
        }
        return chatRoomRepository.save(chatRoom);
    }

    public ChatRoom updateChatRoom(Long id, ChatRoom chatRoomDetails) {
        ChatRoom chatRoom = chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        chatRoom.setName(chatRoomDetails.getName());
        chatRoom.setAvatar(chatRoomDetails.getAvatar());

        return chatRoomRepository.save(chatRoom);
    }

    public void deleteChatRoom(Long id) {
        ChatRoom chatRoom = chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        chatRoomRepository.delete(chatRoom);
    }

    public ChatRoom getChatRoomById(Long id) {
        return chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
    }

    public List<ChatRoom> getAllChatRooms() {
        return chatRoomRepository.findAll();
    }

    public List<ChatRoom> searchChatRooms(String name) {
        return chatRoomRepository.findByNameContaining(name);
    }

    public boolean existsByName(String name) {
        return chatRoomRepository.existsByName(name);
    }
}
