package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.ChatMessageEvent;
import com.thitiphatx.secondhand.model.Conversation;
import com.thitiphatx.secondhand.model.LastMessage;
import com.thitiphatx.secondhand.model.Message;
import com.thitiphatx.secondhand.model.ResourceNotFoundException;
import com.thitiphatx.secondhand.repository.ConversationRepository;
import com.thitiphatx.secondhand.repository.MessageRepository;
import com.thitiphatx.secondhand.dto.ConversationDto;
import com.thitiphatx.secondhand.dto.ParticipantDto;
import com.thitiphatx.secondhand.repository.UserRepository;
import com.thitiphatx.secondhand.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public ConversationDto getOrCreateConversation(
            String userId1,
            String userId2
    ) {
        Conversation conversation = conversationRepository.findByParticipantsContainingAndParticipantsContaining(userId1, userId2)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder()
                                .participants(List.of(userId1, userId2))
                                .build()
                ));

        Map<String, String> userNames = new HashMap<>();
        userRepository.findAllById(List.of(userId1, userId2)).forEach(u -> userNames.put(u.getId(), u.getName()));

        List<ParticipantDto> participantDtos = conversation.getParticipants().stream()
                .map(id -> new ParticipantDto(id, userNames.getOrDefault(id, "User")))
                .collect(Collectors.toList());

        return ConversationDto.builder()
                .id(conversation.getId())
                .participants(participantDtos)
                .lastMessage(conversation.getLastMessage())
                .unreadCount(conversation.getUnreadCount())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    @Transactional
    public Message sendMessage(String senderId, String conversationId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        Message message = messageRepository.save(
                Message.builder()
                        .conversationId(conversationId)
                        .senderId(senderId)
                        .content(content)
                        .build()
        );

        String receiverId = conversation.getParticipants().stream()
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        // update unread count + last message
        Map<String, Integer> unread = new HashMap<>(conversation.getUnreadCount());
        unread.put(receiverId, unread.getOrDefault(receiverId, 0) + 1);
        conversation.setLastMessage(new LastMessage(content, LocalDateTime.now()));
        conversation.setUnreadCount(unread);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Publish to Redis Pub/Sub
        ChatMessageEvent event = ChatMessageEvent.builder()
                .receiverId(receiverId)
                .message(message)
                .build();
        redisTemplate.convertAndSend("chat:messages", event);

        String redisKey = "chat:" + conversationId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(redisKey))) {
            redisTemplate.opsForList().rightPush(redisKey, message);
            redisTemplate.expire(redisKey, Duration.ofDays(1));
        }

        return message;
    }

    public void markAsRead(String conversationId, String userId) {
        // Bulk update unread messages in the database
        Query query = new Query(Criteria.where("conversationId").is(conversationId)
                .and("senderId").ne(userId)
                .and("read").is(false));
        Update update = new Update().set("read", true);
        mongoTemplate.updateMulti(query, update, Message.class);

        // Reset unread count
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        Map<String, Integer> unread = new HashMap<>(conv.getUnreadCount());
        unread.put(userId, 0);

        conv.setUnreadCount(unread);
        conversationRepository.save(conv);

        // Evict conversation messages cache in Redis
        redisTemplate.delete("chat:" + conversationId);
    }

    public List<ConversationDto> getUserConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantsContaining(userId);

        Set<String> participantIds = conversations.stream()
                .flatMap(c -> c.getParticipants().stream())
                .collect(Collectors.toSet());

        Map<String, String> userNames = new HashMap<>();
        userRepository.findAllById(participantIds).forEach(u -> userNames.put(u.getId(), u.getName()));

        return conversations.stream().map(c -> {
            List<ParticipantDto> participantDtos = c.getParticipants().stream()
                    .map(id -> new ParticipantDto(id, userNames.getOrDefault(id, "User")))
                    .collect(Collectors.toList());

            return ConversationDto.builder()
                    .id(c.getId())
                    .participants(participantDtos)
                    .lastMessage(c.getLastMessage())
                    .unreadCount(c.getUnreadCount())
                    .updatedAt(c.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    public List<Message> getMessages(String conversationId) {
        String redisKey = "chat:" + conversationId;
        
        // Try to get from Redis
        List<Object> cached = redisTemplate.opsForList().range(redisKey, 0, -1);
        if (cached != null && !cached.isEmpty()) {
            redisTemplate.expire(redisKey, Duration.ofDays(1));
            return cached.stream()
                    .map(obj -> (Message) obj)
                    .collect(Collectors.toList());
        }

        // If not in Redis, load from DB
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        // Cache them in Redis
        if (!messages.isEmpty()) {
            redisTemplate.delete(redisKey);
            for (Message message : messages) {
                redisTemplate.opsForList().rightPush(redisKey, message);
            }
            redisTemplate.expire(redisKey, Duration.ofDays(1));
        }
        
        return messages;
    }
}

