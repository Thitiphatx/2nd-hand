package com.thitiphatx.secondhand.repository;

import com.thitiphatx.secondhand.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);
    Integer countByConversationIdAndReadFalseAndSenderIdNot(String conversationId, String userId);
}
