package com.thitiphatx.secondhand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    private String id;
    private List<String> participants;
    private LastMessage lastMessage;

    @Builder.Default
    private Map<String, Integer> unreadCount = new HashMap<>();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}