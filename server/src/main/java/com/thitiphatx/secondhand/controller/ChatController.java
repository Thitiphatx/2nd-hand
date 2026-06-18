package com.thitiphatx.secondhand.controller;

import com.thitiphatx.secondhand.dto.ConversationDto;
import com.thitiphatx.secondhand.dto.MessagePayload;
import com.thitiphatx.secondhand.dto.SendMessageRequest;
import com.thitiphatx.secondhand.model.Message;
import com.thitiphatx.secondhand.model.User;
import com.thitiphatx.secondhand.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;

    @GetMapping("/conversations")
    public List<ConversationDto> getUserConversations(@AuthenticationPrincipal User user) {
        return chatService.getUserConversations(user.getId());
    }

    @PostMapping("/conversations/{userId}")
    public ConversationDto getOrCreateConversation(
            @PathVariable String userId,
            @AuthenticationPrincipal User user
    ) {
        return chatService.getOrCreateConversation(user.getId(), userId);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<Message> getMessages(
            @PathVariable String conversationId,
            @AuthenticationPrincipal User user
    ) {
        return chatService.getMessages(conversationId);
    }

    @PostMapping("/messages")
    public Message sendMessage(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal User user
    ) {
        return chatService.sendMessage(user.getId(), request.getConversationId(), request.getContent());
    }

    @PostMapping("/conversations/{conversationId}/read")
    public void markAsRead(
            @PathVariable String conversationId,
            @AuthenticationPrincipal User user
    ) {
        chatService.markAsRead(conversationId, user.getId());
    }

    @MessageMapping("/chat.sendMessage")
    public void sendWebSocketMessage(@Payload MessagePayload payload) {
        chatService.sendMessage(payload.getSenderId(), payload.getConversationId(), payload.getContent());
    }
}
