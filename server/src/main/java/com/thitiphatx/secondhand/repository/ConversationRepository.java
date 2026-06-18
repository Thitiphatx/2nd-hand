package com.thitiphatx.secondhand.repository;

import com.thitiphatx.secondhand.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByParticipantsContaining(String userId);
    
    @Query("{ 'participants': { '$all': [ ?0, ?1 ] } }")
    Optional<Conversation> findByParticipantsContainingAndParticipantsContaining(String userId1, String userId2);
}
