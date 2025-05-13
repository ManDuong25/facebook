package backend.backend.service;

import backend.backend.model.ChatRoom;
import backend.backend.model.ChatRoomMember;
import backend.backend.model.User;
import backend.backend.repository.ChatRoomMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ChatRoomMemberService {
    @Autowired
    private ChatRoomMemberRepository chatRoomMemberRepository;

    public ChatRoomMember addMember(ChatRoom room, User user, ChatRoomMember.Role role) {
        if (chatRoomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new RuntimeException("User is already a member of this chat room");
        }

        ChatRoomMember member = new ChatRoomMember();
        member.setRoom(room);
        member.setUser(user);
        member.setRole(role);

        return chatRoomMemberRepository.save(member);
    }

    public void removeMember(Long memberId) {
        ChatRoomMember member = chatRoomMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        chatRoomMemberRepository.delete(member);
    }

    public void updateMemberRole(Long memberId, ChatRoomMember.Role newRole) {
        ChatRoomMember member = chatRoomMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setRole(newRole);
        chatRoomMemberRepository.save(member);
    }

    public List<ChatRoomMember> getRoomMembers(ChatRoom room) {
        return chatRoomMemberRepository.findByRoom(room);
    }

    public List<ChatRoomMember> getUserRooms(User user) {
        return chatRoomMemberRepository.findByUser(user);
    }

    public ChatRoomMember getMember(ChatRoom room, User user) {
        return chatRoomMemberRepository.findByRoomAndUser(room, user)
                .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public List<ChatRoomMember> getRoomAdmins(ChatRoom room) {
        return chatRoomMemberRepository.findByRoomAndRole(room, ChatRoomMember.Role.ADMIN);
    }

    public boolean isMember(ChatRoom room, User user) {
        return chatRoomMemberRepository.existsByRoomAndUser(room, user);
    }

    public void updateLastSeen(Long memberId) {
        ChatRoomMember member = chatRoomMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setLastSeenAt(java.time.LocalDateTime.now());
        chatRoomMemberRepository.save(member);
    }
}