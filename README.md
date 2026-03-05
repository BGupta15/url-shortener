# Shortly — URL Shortener with Analytics

A full-stack URL shortening service with click analytics, JWT authentication, Redis caching, custom aliases, link expiry, and a React dashboard. Containerised with Docker for one-command deployment.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)

---

## Features

- **Shorten URLs** — 7-character codes generated with nanoid
- **Custom aliases** — pick your own short code (3–20 alphanumeric characters)
- **Expiry dates** — links auto-expire after a set number of days (returns HTTP 410)
- **Click analytics** — every redirect logs timestamp, referrer, IP, and user agent
- **Redis caching** — hot redirects served from RAM with 1-hour TTL
- **JWT auth** — register, login, 7-day token, all write routes protected
- **Rate limiting** — 30 requests per 15-minute window per IP
- **React dashboard** — stats overview, link table, copy-to-clipboard, delete
- **Charts** — daily click timeline and top referrers per link (Recharts)
- **Docker compose** — all four services start with one command

---

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Backend     | Node.js, Express.js                     |
| Frontend    | React, React Router, Recharts, Axios    |
| Database    | PostgreSQL 16                           |
| Cache       | Redis 7                                 |
| Auth        | JWT (jsonwebtoken), bcryptjs            |
| Other       | nanoid, express-rate-limit, cors, dotenv|

---

## Environment Variables

| Variable       | Example                                          | Description                        |
|----------------|--------------------------------------------------|------------------------------------|
| `DATABASE_URL` | `postgresql://postgres:pass@localhost:5432/db`   | PostgreSQL connection string        |
| `REDIS_URL`    | `redis://localhost:6379`                         | Redis connection string             |
| `JWT_SECRET`   | `change_this_in_production`                      | Secret key for signing tokens       |
| `BASE_URL`     | `http://localhost:3000`                          | Used to construct short URLs        |
| `PORT`         | `3000`                                           | Backend server port                 |

---

## API Reference

| Method   | Route                | Auth | Description                                         |
|----------|----------------------|------|-----------------------------------------------------|
| `POST`   | `/auth/register`     | No   | Create a new user account                           |
| `POST`   | `/auth/login`        | No   | Login and receive a JWT token                       |
| `POST`   | `/shorten`           | Yes  | Create a short URL with optional alias and expiry   |
| `GET`    | `/:code`             | No   | Redirect to original URL (served from Redis cache)  |
| `GET`    | `/urls/mine`         | Yes  | List all URLs created by the authenticated user     |
| `DELETE` | `/urls/:code`        | Yes  | Delete a URL and invalidate its Redis cache entry   |
| `GET`    | `/analytics/:code`   | Yes  | Get click count, daily timeline, and top referrers  |

### Example: Create a short URL
```bash
# Login first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'

# Shorten a URL with a custom alias expiring in 7 days
curl -X POST http://localhost:3000/shorten \
  -H "Authorization: Bearer " \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "alias": "gh", "expires_in_days": 7}'
```

Response:
```json
{
  "short_url": "http://localhost:3000/gh",
  "short_code": "gh",
  "original_url": "https://github.com",
  "is_custom": true
}
```

---

## Database Schema
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE urls (
  id            SERIAL PRIMARY KEY,
  original_url  TEXT NOT NULL,
  short_code    VARCHAR(10) UNIQUE NOT NULL,
  is_custom     BOOLEAN DEFAULT FALSE,
  expires_at    TIMESTAMP DEFAULT NULL,
  created_by    VARCHAR(100),
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clicks (
  id          SERIAL PRIMARY KEY,
  short_code  VARCHAR(10) REFERENCES urls(short_code),
  clicked_at  TIMESTAMP DEFAULT NOW(),
  referrer    TEXT,
  ip_address  VARCHAR(50),
  user_agent  TEXT
);
```
