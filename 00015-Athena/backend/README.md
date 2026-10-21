# Authentication API

## Setup

Requires Node.js 20+ and MongoDB. From this directory:

```sh
npm install
cp .env.example .env
npm run dev
```

Set distinct random values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` in `.env`. The API listens on port `5001` by default. Start the Vite client separately from `../frontend`; its `/api` proxy forwards to this server, so no CORS middleware is needed in local development.

## Routes

Base path: `/api/v1/auth`

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Validate and create an account; return access token and public user; set refresh cookie. |
| `POST` | `/login` | Verify credentials; return access token and public user; set refresh cookie. |
| `POST` | `/refresh` | Verify cookie and persisted token, rotate the token pair, and reset cookie. |
| `POST` | `/logout` | Invalidate the persisted refresh token and clear the cookie. |
| `GET` | `/me` | Return the public user for a valid bearer access token. |

Success responses include `success`, `message`, and `data`. Failure responses include `success`, `message`, and `errors`; development responses also include `stack`.

Registration request:

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "analytical123" }
```

Login request:

```json
{ "email": "ada@example.com", "password": "analytical123" }
```

Registration and login return `data.accessToken` and `data.user` and set a seven-day httpOnly refresh cookie scoped to `/api/v1/auth`. Refresh accepts that cookie and returns the same data shape with a newly issued access token. Logout returns `data: {}`. The profile route requires `Authorization: Bearer <access-token>` and returns `data.user`.

Invalid login credentials always return `401` with message `Invalid credentials` and an empty `errors` list. Validation failures return `422` with field-specific errors, for example:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Enter a valid email address" }] }
```