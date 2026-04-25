package com.jyotishjourney.blogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponse implements Serializable {
    private Long id;
    private String title;
    private String description;
    private String coverImageUrl;
    private Long authorId;
    private String authorName;
    private List<String> tags;
    private String status;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
