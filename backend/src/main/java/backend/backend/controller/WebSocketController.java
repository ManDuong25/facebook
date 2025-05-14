package backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import backend.backend.dto.VideoCallEnd;
import backend.backend.dto.VideoCallRequest;
import backend.backend.dto.VideoCallResponse;
import backend.backend.model.Friend;
import backend.backend.model.User;
import backend.backend.service.FriendService;
import backend.backend.service.UserService;
import backend.backend.model.Notification;

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

    // Phương thức để gửi thông báo realtime khi có bài post mới
    public void notifyNewPost(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

    public void notifyNewComment(Long userId, Notification notification) {
        // Gửi thông báo đến người dùng cụ thể
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/topic/notifications",
                notification);
    }

    public void broadcastComment(Long postId, Object message) {
        // Gửi thông báo đến tất cả người dùng đang xem bài post
        messagingTemplate.convertAndSend(
                "/topic/comments/" + postId,
                message);
    }

    // Phương thức để gửi thông báo realtime khi có like mới
    public void notifyNewLike(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

    public void notifyNewShare(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

    // Handle video call request
    @MessageMapping("/video/call")
    public void handleVideoCall(VideoCallRequest request) {
        // Send call request to the receiver
        messagingTemplate.convertAndSend(
                "/topic/video/call/" + request.getReceiverId(),
                request);
    }

    // Handle video call response
    @MessageMapping("/video/response")
    public void handleVideoCallResponse(VideoCallResponse response) {
        // Send response back to the caller
        messagingTemplate.convertAndSend(
                "/topic/video/response/" + response.getCallerId(),
                response);

        // If call is accepted, notify the caller that receiver has picked up
        if (response.isAccepted()) {
            messagingTemplate.convertAndSend(
                    "/topic/video/pickup/" + response.getCallerId(),
                    response);
        }
    }

    // Handle video call end
    @MessageMapping("/video/end")
    public void handleVideoCallEnd(VideoCallEnd request) {
        // Notify both parties that the call has ended
        messagingTemplate.convertAndSend(
                "/topic/video/end/" + request.getCallerId(),
                request);
        messagingTemplate.convertAndSend(
                "/topic/video/end/" + request.getReceiverId(),
                request);
    }
}
