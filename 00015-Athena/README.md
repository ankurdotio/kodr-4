# Athena Authentication Boilerplate

Full-stack authentication starter with an Express/MongoDB API and a Vite React client. The backend uses JavaScript ES modules, JWT access tokens, and rotating refresh tokens stored in httpOnly cookies. The frontend keeps the short-lived access token in memory and in Redux state.

## Requirements

- Node.js 20 or newer
- MongoDB available at the URI configured in `backend/.env`

## Run locally

In one terminal:

```sh
cd backend
npm install
cp .env.example .env
npm run dev
```

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

The Vite server is available at `http://localhost:5173` and proxies `/api` to `http://localhost:5001`. Set `VITE_API_PROXY_TARGET` in the frontend environment to override that backend URL. Replace both example token secrets with distinct random values before deployment.

## Frontend layers

- `frontend/src/api`: shared Axios client and auth endpoint functions
- `frontend/src/ui`: routed pages and reusable visual components
- `frontend/src/state`: Redux store and authentication slice
- `frontend/src/hooks`: UI-facing authentication hook

## API

All endpoints are under `/api/v1/auth`. Responses use `{ "success": true, "message": "...", "data": ... }` on success and `{ "success": false, "message": "...", "errors": [...] }` on failure.

### `POST /register`

Request:

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "analytical123" }
```

Response (`201`; also sets the refresh cookie):

```json
{ "success": true, "message": "Registration successful", "data": { "accessToken": "<access-token>", "user": { "id": "<user-id>", "name": "Ada Lovelace", "email": "ada@example.com" } } }
```

### `POST /login`

Request:

```json
{ "email": "ada@example.com", "password": "analytical123" }
```

Response (`200`; also sets the refresh cookie) has the same `data` shape as registration, with message `Login successful`. Invalid credentials return `401` with message `Invalid credentials`.

### `POST /refresh`

Send the httpOnly refresh cookie; no request body is needed. A valid, persisted refresh token is rotated, and the response sets the replacement cookie:

```json
{ "success": true, "message": "Session refreshed", "data": { "accessToken": "<new-access-token>", "user": { "id": "<user-id>", "name": "Ada Lovelace", "email": "ada@example.com" } } }
```

### `POST /logout`

Send the refresh cookie to invalidate the session and clear the cookie:

```json
{ "success": true, "message": "Logout successful", "data": {} }
```

### `GET /me`

Send `Authorization: Bearer <access-token>`:

```json
{ "success": true, "message": "Profile retrieved", "data": { "user": { "id": "<user-id>", "name": "Ada Lovelace", "email": "ada@example.com" } } }
```

### Validation error example

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Enter a valid email address" }] }
```

See [backend/README.md](backend/README.md) for backend-specific setup and API details.