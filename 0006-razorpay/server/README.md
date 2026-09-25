# Auth Backend

Production-oriented Express.js authentication API (JavaScript, ESM) with MongoDB/Mongoose and JWT access/refresh tokens.

## Install & Run

```bash
cd server
npm install
cp .env.example .env   # then fill in real secrets and a running MongoDB URI
npm run dev             # start with node --watch
npm start                # run without watch
```

## Vite Dev Proxy

No CORS is configured on this server. In your frontend's `vite.config.ts`, proxy API calls instead:

```ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

## Endpoints

All responses use the envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

or

```json
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

### POST /api/v1/auth/register

Request:
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "letmein123" }
```
Response (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com" }, "accessToken": "..." }
}
```

### POST /api/v1/auth/login

Request:
```json
{ "email": "ada@example.com", "password": "letmein123" }
```
Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com" }, "accessToken": "..." }
}
```

### POST /api/v1/auth/refresh

Reads the httpOnly `refreshToken` cookie, rotates both tokens.

Response (200):
```json
{ "success": true, "message": "Token refreshed", "data": { "accessToken": "..." } }
```

### POST /api/v1/auth/logout

Response (200):
```json
{ "success": true, "message": "Logout successful", "data": {} }
```

### GET /api/v1/auth/me

Requires `Authorization: Bearer <accessToken>`.

Response (200):
```json
{ "success": true, "message": "Current user", "data": { "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com" } } }
```
