package backend.backend.repository;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMember;
import backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByRoom(ChatRoom room);

    List<ChatRoomMember> findByUser(User user);

    Optional<ChatRoomMember> findByRoomAndUser(ChatRoom room, User user);

    boolean existsByRoomAndUser(ChatRoom room, User user);

    List<ChatRoomMember> findByRoomAndRole(ChatRoom room, ChatRoomMember.Role role);
}