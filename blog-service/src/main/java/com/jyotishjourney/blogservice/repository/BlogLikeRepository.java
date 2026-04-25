package com.jyotishjourney.blogservice.repository;

import com.jyotishjourney.blogservice.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {
    Optional<BlogLike> findByBlogIdAndUserId(Long blogId, Long userId);
    boolean existsByBlogIdAndUserId(Long blogId, Long userId);
}
