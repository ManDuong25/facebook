package backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import backend.backend.model.Friend;
import backend.backend.model.User;
import backend.backend.service.FriendService;
import backend.backend.service.UserService;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserService userService;

    @MessageMapping("/friend/accept")
    @SendTo("/topic/friends")
    public Friend handleFriendAccept(Friend friend) {
        // Gửi thông báo đến tất cả người dùng đang lắng nghe topic /topic/friends
        return friend;
    }

    // Phương thức để gửi thông báo khi có kết bạn mới
    public void notifyNewFriendship(Long userId, Friend friend) {
        // Lấy thông tin đầy đủ của người dùng
        User user1 = userService.findById(friend.getUser1().getId()).orElse(null);
        User user2 = userService.findById(friend.getUser2().getId()).orElse(null);

        if (user1 != null && user2 != null) {
            // Tạo đối tượng Friend mới với thông tin đầy đủ
            Friend completeFriend = new Friend();
            completeFriend.setId(friend.getId());
            completeFriend.setUser1(user1);
            completeFriend.setUser2(user2);
            completeFriend.setSince(friend.getSince());

            // Gửi thông báo với thông tin đầy đủ
            messagingTemplate.convertAndSend("/topic/friends/" + userId, completeFriend);
        }
    }
}
