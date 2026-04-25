package com.jyotishjourney.blogservice.repository;

import com.jyotishjourney.blogservice.entity.Blog;
import com.jyotishjourney.blogservice.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    Page<Blog> findAllByStatus(BlogStatus status, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.status = :status AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(b.authorName) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Blog> searchBlogsByStatus(@Param("q") String query, @Param("status") BlogStatus status, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.status = 'APPROVED' AND b.createdAt >= :since ORDER BY b.likeCount DESC")
    List<Blog> findHotBlogs(@Param("since") LocalDateTime since, Pageable pageable);

    Page<Blog> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    @Query("SELECT b FROM Blog b JOIN b.tags t WHERE LOWER(t) = LOWER(:tag) ORDER BY b.createdAt DESC")
    Page<Blog> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(b.authorName) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Blog> searchBlogs(@Param("q") String query, Pageable pageable);
}
