package com.jyotishjourney.blogservice.repository;

import com.jyotishjourney.blogservice.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByBlogIdOrderByCreatedAtDesc(Long blogId, Pageable pageable);
    int countByBlogId(Long blogId);
}
