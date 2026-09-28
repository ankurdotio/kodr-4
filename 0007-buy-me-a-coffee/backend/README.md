# Buy Me a Coffee — Backend

Express + MongoDB auth API (JavaScript, ESM). JWT access tokens + rotating httpOnly refresh-token cookies.

## Run

```bash
cp .env.example .env   # fill in secrets
npm install
npm run dev            # or: npm start
```

Requires Node.js 20+ and a running MongoDB instance.

## Vite dev proxy

```js
// vite.config.js
export default {
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
};
```

## Endpoints (`/api/v1/auth`)

All responses use one envelope:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

### POST `/register`

```json
{ "name": "Ankur", "username": "ankur_p", "email": "ankur@example.com", "password": "secret123" }
```

`201` — sets `refreshToken` cookie:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "Ankur", "username": "ankur_p", "email": "ankur@example.com", "createdAt": "...", "updatedAt": "..." },
    "accessToken": "..."
  }
}
```

`422` validation errors, `409` if email/username is taken:

```json
{ "success": false, "message": "Duplicate value", "errors": [{ "field": "username", "message": "username is already in use" }] }
```

### POST `/login`

```json
{ "email": "ankur@example.com", "password": "secret123" }
```

`200` — same `data` shape as register. `401`:

```json
{ "success": false, "message": "Invalid credentials", "errors": [] }
```

### POST `/refresh`

Uses the `refreshToken` cookie; rotates it.

```json
{ "success": true, "message": "Token refreshed", "data": { "accessToken": "..." } }
```

### POST `/logout`

```json
{ "success": true, "message": "Logout successful", "data": null }
```

### GET `/me`

Header: `Authorization: Bearer <accessToken>`

```json
{ "success": true, "message": "User fetched", "data": { "user": { "id": "...", "name": "Ankur", "username": "ankur_p", "email": "ankur@example.com" } } }
```
