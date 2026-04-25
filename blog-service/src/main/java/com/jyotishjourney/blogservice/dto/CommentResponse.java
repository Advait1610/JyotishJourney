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
public class CommentResponse implements Serializable {
    private Long id;
    private Long blogId;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
