package backend.backend.dto;

public class VideoCallRequest {
    // Video call request model
    private Long callerId;
    private Long receiverId;
    private String callerName;
    private String callerAvatar;
    private String roomId;

    // Getters and setters
    public Long getCallerId() {
        return callerId;
    }

    public void setCallerId(Long callerId) {
        this.callerId = callerId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getCallerName() {
        return callerName;
    }

    public void setCallerName(String callerName) {
        this.callerName = callerName;
    }

    public String getCallerAvatar() {
        return callerAvatar;
    }

    public void setCallerAvatar(String callerAvatar) {
        this.callerAvatar = callerAvatar;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
}
