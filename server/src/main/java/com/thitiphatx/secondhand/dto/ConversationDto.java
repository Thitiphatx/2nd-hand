package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.LastMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private String id;
    private List<ParticipantDto> participants;
    private LastMessage lastMessage;
    private Map<String, Integer> unreadCount;
    private LocalDateTime updatedAt;
}
