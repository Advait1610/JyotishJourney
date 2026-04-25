# Jyotish Journey - Astrology Blog Platform

A full-stack astrology blog platform built with **Spring Boot Microservices** and **Angular 17**.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Angular 17     │────▶│  API Gateway     │────▶│  Eureka Server   │
│  Frontend :4200 │     │  :8080           │     │  :8761           │
└─────────────────┘     └──────┬───────────┘     └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
            ┌──────────────┐     ┌──────────────┐
            │ User Service │     │ Blog Service │
            │ :8081        │     │ :8082        │
            │ PostgreSQL   │     │ PostgreSQL   │
            └──────────────┘     └──────────────┘
```

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring Cloud (Gateway, Eureka), Spring Security, JWT, OAuth2 (Google), Spring Data JPA, PostgreSQL
- **Frontend:** Angular 17, Angular Material, ngx-quill, SCSS, CSS Animations
- **Infra:** Docker, Docker Compose

## Features

- JWT + Google OAuth2 authentication
- Rich text blog editor with inline image support
- Blog CRUD with cover images, tags, and formatted content
- Like and comment functionality
- Hot/trending posts slider
- Astrology-themed UI with zodiac wheel, planet orbits, constellation, and twinkling star animations
- Responsive design

## Quick Start (Docker)

```bash
# Set Google OAuth credentials (optional)
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

# Start all services
docker-compose up --build
```

Services will be available at:
- **Frontend:** http://localhost:4200
- **API Gateway:** http://localhost:8080
- **Eureka Dashboard:** http://localhost:8761

## Local Development

### Backend

Each service can be run independently. Start in this order:

1. **PostgreSQL** - Start two instances (ports 5432, 5433)
2. **Discovery Server** - `cd discovery-server && mvn spring-boot:run`
3. **User Service** - `cd user-service && mvn spring-boot:run`
4. **Blog Service** - `cd blog-service && mvn spring-boot:run`
5. **API Gateway** - `cd api-gateway && mvn spring-boot:run`

### Frontend

```bash
cd frontend
npm install
npm start
```

The dev server proxies API requests to `localhost:8080` (the gateway).

## Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable the Google+ API
3. Create OAuth2 credentials (Web application)
4. Set authorized redirect URI to: `http://localhost:8080/api/users/oauth2/callback`
5. Set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
