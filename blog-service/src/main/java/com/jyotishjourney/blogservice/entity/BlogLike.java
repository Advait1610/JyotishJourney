package com.jyotishjourney.blogservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"blog_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
