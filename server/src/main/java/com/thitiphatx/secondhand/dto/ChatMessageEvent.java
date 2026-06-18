package com.thitiphatx.secondhand.dto;

import com.thitiphatx.secondhand.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEvent implements Serializable {
    private String receiverId;
    private Message message;
}
