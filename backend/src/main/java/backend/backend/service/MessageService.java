package backend.backend.service;

import backend.backend.model.Message;
import backend.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesBetweenUsers(Long user1Id, Long user2Id) {
        return messageRepository.findMessagesBetweenUsers(user1Id, user2Id);
    }

    public List<Message> getMessagesByUserId(Long userId) {
        return messageRepository.findMessagesByUserId(userId);
    }
}


