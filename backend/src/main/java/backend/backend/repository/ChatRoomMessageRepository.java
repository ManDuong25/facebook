package backend.backend.repository;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMessage;
import backend.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomMessageRepository extends JpaRepository<ChatRoomMessage, Long> {
    List<ChatRoomMessage> findByRoom(ChatRoom room);

    List<ChatRoomMessage> findBySender(User sender);

    List<ChatRoomMessage> findByRoomAndMessageType(ChatRoom room, ChatRoomMessage.MessageType messageType);

    Page<ChatRoomMessage> findByRoomOrderByCreatedAtDesc(ChatRoom room, Pageable pageable);

    List<ChatRoomMessage> findByRoomAndIsDeletedFalse(ChatRoom room);

    List<ChatRoomMessage> findByRoomAndIsDeletedFalseOrderByCreatedAtAsc(ChatRoom room);
}