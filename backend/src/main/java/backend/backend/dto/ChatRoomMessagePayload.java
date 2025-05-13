package backend.backend.dto;

import backend.backend.model.ChatRoomMessage;

public class ChatRoomMessagePayload {
    private Long roomId;
    private Long senderId;
    private String content;
    private ChatRoomMessage.MessageType messageType;

    // Getters and Setters
    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ChatRoomMessage.MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(ChatRoomMessage.MessageType messageType) {
        this.messageType = messageType;
    }
}
