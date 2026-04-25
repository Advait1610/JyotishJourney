package com.jyotishjourney.blogservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BlogRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 300)
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String coverImageUrl;

    private List<String> tags;
}
