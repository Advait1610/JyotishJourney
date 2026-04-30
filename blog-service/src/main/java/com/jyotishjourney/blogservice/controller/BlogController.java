package com.jyotishjourney.blogservice.controller;

import com.jyotishjourney.blogservice.dto.*;
import com.jyotishjourney.blogservice.service.BlogService;
import com.jyotishjourney.blogservice.service.ImageStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final ImageStorageService imageStorageService;

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody BlogRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Name") String userName) {
        return ResponseEntity.ok(blogService.createBlog(request, userId, userName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlog(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(blogService.getBlog(id, userId));
    }

    @GetMapping
    public ResponseEntity<Page<BlogResponse>> getAllBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String search,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Sort sort = order.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(blogService.searchBlogs(search.trim(), pageable, userId));
        }
        return ResponseEntity.ok(blogService.getAllBlogs(pageable, userId));
    }

    @GetMapping("/hot")
    public ResponseEntity<List<BlogResponse>> getHotBlogs(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(blogService.getHotBlogs(userId));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<BlogResponse>> getMyBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestHeader("X-User-Id") Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(blogService.getMyBlogs(userId, pageable));
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<BlogResponse>> getPendingBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-User-Email") String adminEmail) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(blogService.getPendingBlogs(pageable, adminEmail));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BlogResponse> approveBlog(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String adminEmail) {
        return ResponseEntity.ok(blogService.approveBlog(id, adminEmail));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BlogResponse> rejectBlog(
            @PathVariable Long id,
            @RequestHeader("X-User-Email") String adminEmail) {
        return ResponseEntity.ok(blogService.rejectBlog(id, adminEmail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(blogService.updateBlog(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        blogService.deleteBlog(id, userId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        return ResponseEntity.ok(blogService.toggleLike(id, userId, userName));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(blogService.getComments(id, PageRequest.of(page, size)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Name") String userName) {
        return ResponseEntity.ok(blogService.addComment(id, request, userId, userName));
    }

    @DeleteMapping("/{blogId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long blogId,
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        blogService.deleteComment(blogId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = imageStorageService.storeImage(file);
        return ResponseEntity.ok(Map.of("url", imageUrl));
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws MalformedURLException {
        Path filePath = imageStorageService.getImagePath(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "image/jpeg";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) contentType = "image/png";
        else if (lower.endsWith(".gif")) contentType = "image/gif";
        else if (lower.endsWith(".webp")) contentType = "image/webp";
        else if (lower.endsWith(".svg")) contentType = "image/svg+xml";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
