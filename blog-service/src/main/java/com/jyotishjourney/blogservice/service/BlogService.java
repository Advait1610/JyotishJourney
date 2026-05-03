package com.jyotishjourney.blogservice.service;

import com.jyotishjourney.blogservice.dto.*;
import com.jyotishjourney.blogservice.entity.Blog;
import com.jyotishjourney.blogservice.entity.BlogLike;
import com.jyotishjourney.blogservice.entity.BlogStatus;
import com.jyotishjourney.blogservice.entity.Comment;
import com.jyotishjourney.blogservice.entity.NotificationType;
import com.jyotishjourney.blogservice.repository.BlogLikeRepository;
import com.jyotishjourney.blogservice.repository.BlogRepository;
import com.jyotishjourney.blogservice.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlogService {

    private static final String ADMIN_EMAIL = "naikadvait2002@gmail.com";

    private final BlogRepository blogRepository;
    private final CommentRepository commentRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final NotificationService notificationService;

    @Caching(evict = {
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public BlogResponse createBlog(BlogRequest request, Long authorId, String authorName) {
        return createBlog(request, authorId, authorName, null);
    }

    @Caching(evict = {
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public BlogResponse createBlog(BlogRequest request, Long authorId, String authorName, String authorEmail) {
        BlogStatus status = isAdmin(authorEmail) ? BlogStatus.APPROVED : BlogStatus.PENDING;

        Blog blog = Blog.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImageUrl(request.getCoverImageUrl())
                .authorId(authorId)
                .authorName(authorName)
                .status(status)
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .build();

        blog = blogRepository.save(blog);
        log.info("Blog created (id={}, status={}), evicted blogs/hotBlogs caches", blog.getId(), status);
        return mapToResponse(blog, null);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "blog", key = "#id")
    public BlogResponse getBlog(Long id, Long currentUserId) {
        log.info("Cache MISS for blog id={}", id);
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        return mapToResponse(blog, currentUserId);
    }

    @Transactional(readOnly = true)
    public Page<BlogResponse> getAllBlogs(Pageable pageable, Long currentUserId) {
        return blogRepository.findAllByStatus(BlogStatus.APPROVED, pageable)
                .map(blog -> mapToResponse(blog, currentUserId));
    }

    public Page<BlogResponse> searchBlogs(String query, Pageable pageable, Long currentUserId) {
        return blogRepository.searchBlogsByStatus(query, BlogStatus.APPROVED, pageable)
                .map(blog -> mapToResponse(blog, currentUserId));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "hotBlogs", key = "'hot'")
    public List<BlogResponse> getHotBlogs(Long currentUserId) {
        log.info("Cache MISS for hotBlogs");
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        return blogRepository.findHotBlogs(oneWeekAgo, PageRequest.of(0, 10))
                .stream()
                .map(blog -> mapToResponse(blog, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BlogResponse> getMyBlogs(Long authorId, Pageable pageable) {
        return blogRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
                .map(blog -> mapToResponse(blog, authorId));
    }

    @Transactional(readOnly = true)
    public Page<BlogResponse> getPendingBlogs(Pageable pageable, String adminEmail) {
        if (!isAdmin(adminEmail)) {
            throw new RuntimeException("Only admin can view pending blogs");
        }
        return blogRepository.findAllByStatus(BlogStatus.PENDING, pageable)
                .map(blog -> mapToResponse(blog, null));
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "blog", key = "#id"),
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public BlogResponse approveBlog(Long id, String adminEmail) {
        if (!isAdmin(adminEmail)) {
            throw new RuntimeException("Only admin can approve blogs");
        }
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        blog.setStatus(BlogStatus.APPROVED);
        blog = blogRepository.save(blog);
        log.info("Blog approved (id={}), evicted caches", id);
        return mapToResponse(blog, null);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "blog", key = "#id"),
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public BlogResponse rejectBlog(Long id, String adminEmail) {
        if (!isAdmin(adminEmail)) {
            throw new RuntimeException("Only admin can reject blogs");
        }
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        blog.setStatus(BlogStatus.REJECTED);
        blog = blogRepository.save(blog);
        log.info("Blog rejected (id={}), evicted caches", id);
        return mapToResponse(blog, null);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "blog", key = "#id"),
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public BlogResponse updateBlog(Long id, BlogRequest request, Long userId) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own blogs");
        }

        blog.setTitle(request.getTitle());
        blog.setDescription(request.getDescription());
        if (request.getCoverImageUrl() != null) {
            blog.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getTags() != null) {
            blog.getTags().clear();
            blog.getTags().addAll(request.getTags());
        }

        blog.setStatus(BlogStatus.PENDING);

        blog = blogRepository.save(blog);
        log.info("Blog updated (id={}), set to PENDING for re-approval, evicted caches", id);
        return mapToResponse(blog, userId);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "blog", key = "#id"),
            @CacheEvict(value = "blogs", allEntries = true),
            @CacheEvict(value = "hotBlogs", allEntries = true),
            @CacheEvict(value = "blogComments", key = "#id")
    })
    public void deleteBlog(Long id, Long userId, String userEmail) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getAuthorId().equals(userId) && !isAdmin(userEmail)) {
            throw new RuntimeException("You can only delete your own blogs");
        }

        blogRepository.delete(blog);
        log.info("Blog deleted (id={}), evicted all related caches", id);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "blog", key = "#blogId"),
            @CacheEvict(value = "hotBlogs", allEntries = true)
    })
    public Map<String, Object> toggleLike(Long blogId, Long userId, String userName) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        var existingLike = blogLikeRepository.findByBlogIdAndUserId(blogId, userId);

        boolean liked;
        if (existingLike.isPresent()) {
            blogLikeRepository.delete(existingLike.get());
            blog.setLikeCount(Math.max(0, blog.getLikeCount() - 1));
            liked = false;
        } else {
            BlogLike like = BlogLike.builder().blog(blog).userId(userId).build();
            blogLikeRepository.save(like);
            blog.setLikeCount(blog.getLikeCount() + 1);
            liked = true;

            notificationService.createNotification(
                    blog.getAuthorId(), userId, userName != null ? userName : "Someone",
                    blogId, blog.getTitle(), NotificationType.LIKE);
        }

        blogRepository.save(blog);
        return Map.of("liked", liked, "likeCount", blog.getLikeCount());
    }

    @Cacheable(value = "blogComments", key = "#blogId + ':' + #pageable.pageNumber")
    public Page<CommentResponse> getComments(Long blogId, Pageable pageable) {
        log.info("Cache MISS for comments blogId={} page={}", blogId, pageable.getPageNumber());
        return commentRepository.findByBlogIdOrderByCreatedAtDesc(blogId, pageable)
                .map(this::mapCommentToResponse);
    }

    @Caching(evict = {
            @CacheEvict(value = "blogComments", key = "#blogId + ':0'"),
            @CacheEvict(value = "blog", key = "#blogId")
    })
    public CommentResponse addComment(Long blogId, CommentRequest request, Long userId, String userName) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        Comment comment = Comment.builder()
                .blog(blog)
                .userId(userId)
                .userName(userName)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        log.info("Comment added to blog {}, evicted comment/blog cache", blogId);

        notificationService.createNotification(
                blog.getAuthorId(), userId, userName,
                blogId, blog.getTitle(), NotificationType.COMMENT);

        return mapCommentToResponse(comment);
    }

    @Caching(evict = {
            @CacheEvict(value = "blogComments", allEntries = true),
            @CacheEvict(value = "blog", key = "#blogId")
    })
    public void deleteComment(Long blogId, Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getBlog().getId().equals(blogId)) {
            throw new RuntimeException("Comment does not belong to this blog");
        }
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted from blog {}, evicted caches", commentId, blogId);
    }

    private boolean isAdmin(String email) {
        return ADMIN_EMAIL.equalsIgnoreCase(email);
    }

    private BlogResponse mapToResponse(Blog blog, Long currentUserId) {
        boolean likedByUser = false;
        if (currentUserId != null) {
            likedByUser = blogLikeRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId);
        }

        int commentCount = 0;
        try {
            if (blog.getComments() != null) {
                commentCount = blog.getComments().size();
            }
        } catch (Exception e) {
            commentCount = commentRepository.countByBlogId(blog.getId());
        }

        return BlogResponse.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .description(blog.getDescription())
                .coverImageUrl(blog.getCoverImageUrl())
                .authorId(blog.getAuthorId())
                .authorName(blog.getAuthorName())
                .tags(blog.getTags() != null ? new ArrayList<>(blog.getTags()) : List.of())
                .status(blog.getStatus().name())
                .likeCount(blog.getLikeCount())
                .commentCount(commentCount)
                .likedByCurrentUser(likedByUser)
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }

    private CommentResponse mapCommentToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .blogId(comment.getBlog().getId())
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
