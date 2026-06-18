package com.thitiphatx.secondhand.service;

import com.thitiphatx.secondhand.dto.ChatMessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisSerializer<Object> serializer = RedisSerializer.json();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            ChatMessageEvent event = (ChatMessageEvent) serializer.deserialize(message.getBody());
            if (event != null && event.getReceiverId() != null && event.getMessage() != null) {
                log.info("Received message via Redis Pub/Sub for receiver: {}", event.getReceiverId());
                
                // Forward to target user
                messagingTemplate.convertAndSend(
                        "/topic/messages." + event.getReceiverId(), event.getMessage()
                );
                messagingTemplate.convertAndSendToUser(
                        event.getReceiverId(), "/queue/messages", event.getMessage()
                );
            }
        } catch (Exception e) {
            log.error("Failed to deserialize or process chat message event from Redis", e);
        }
    }
}
