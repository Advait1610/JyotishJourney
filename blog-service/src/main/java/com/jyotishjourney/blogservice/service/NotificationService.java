package com.jyotishjourney.blogservice.service;

import com.jyotishjourney.blogservice.dto.NotificationResponse;
import com.jyotishjourney.blogservice.entity.Notification;
import com.jyotishjourney.blogservice.entity.NotificationType;
import com.jyotishjourney.blogservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(Long recipientId, Long actorId, String actorName,
                                   Long blogId, String blogTitle, NotificationType type) {
        if (recipientId.equals(actorId)) {
            return;
        }

        String message = switch (type) {
            case LIKE -> actorName + " liked your post \"" + truncate(blogTitle, 60) + "\"";
            case COMMENT -> actorName + " commented on your post \"" + truncate(blogTitle, 60) + "\"";
        };

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .actorId(actorId)
                .actorName(actorName)
                .blogId(blogId)
                .blogTitle(truncate(blogTitle, 200))
                .type(type)
                .message(message)
                .build();

        notificationRepository.save(notification);
        log.info("Notification created: {} for user {} on blog {}", type, recipientId, blogId);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        int count = notificationRepository.markAllReadByRecipientId(userId);
        log.info("Marked {} notifications as read for user {}", count, userId);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .actorId(n.getActorId())
                .actorName(n.getActorName())
                .blogId(n.getBlogId())
                .blogTitle(n.getBlogTitle())
                .type(n.getType().name())
                .message(n.getMessage())
                .read(n.getRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
