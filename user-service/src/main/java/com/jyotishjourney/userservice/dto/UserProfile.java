package com.jyotishjourney.userservice.dto;

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
public class UserProfile implements Serializable {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String provider;
    private LocalDateTime createdAt;
}
