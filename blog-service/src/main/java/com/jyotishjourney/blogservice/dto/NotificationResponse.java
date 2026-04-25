package com.jyotishjourney.blogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse implements Serializable {
    private Long id;
    private Long actorId;
    private String actorName;
    private Long blogId;
    private String blogTitle;
    private String type;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
}
