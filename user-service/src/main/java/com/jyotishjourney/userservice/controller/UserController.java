package com.jyotishjourney.userservice.controller;

import com.jyotishjourney.userservice.dto.*;
import com.jyotishjourney.userservice.service.GoogleOAuthService;
import com.jyotishjourney.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final GoogleOAuthService googleOAuthService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/oauth2/google")
    public ResponseEntity<Void> redirectToGoogle() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(googleOAuthService.getGoogleAuthUrl()));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/oauth2/callback")
    public ResponseEntity<Void> handleGoogleCallback(@RequestParam("code") String code) {
        AuthResponse authResponse = googleOAuthService.handleCallback(code);
        String redirectUrl = frontendUrl + "/oauth-callback?token=" +
                URLEncoder.encode(authResponse.getToken(), StandardCharsets.UTF_8) +
                "&userId=" + authResponse.getUserId() +
                "&name=" + URLEncoder.encode(authResponse.getFullName(), StandardCharsets.UTF_8) +
                "&email=" + URLEncoder.encode(authResponse.getEmail(), StandardCharsets.UTF_8);
        return ResponseEntity.status(302)
                .header("Location", redirectUrl)
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<UserProfile> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
