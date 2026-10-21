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

## Models

- `User` stores the bcrypt password hash, profile fields, timestamps, and preferences. Email is unique and normalized. Refresh tokens are not stored on the user.
- `Session` stores one SHA-256 refresh-token hash per device, user-agent metadata, expiry, revocation time, and the replacement-session reference. `REFRESH_TOKEN_TTL` is seconds; the default is `604800` (seven days).
- `Conversation` and `Message` include ownership references, model/title state, generation state, message status/usage/latency, and the requested search/share indexes.

Configure `BEDROCK_DEFAULT_MODEL` and the comma-separated `BEDROCK_MODEL_ALLOW_LIST` in `.env`. The default model must be present in the allow-list. The example allows `anthropic.claude-3-5-sonnet-20241022-v2:0`.

Use `createConversationWithFirstMessage` from `src/DAO/conversation.dao.js` to persist the first user message before the conversation; the model also rejects direct creation without that message. Conversation/message reads or writes must always include the authenticated `userId`. Message creation/update paths must also update `lastMessageAt`; AI title generation may only replace titles whose `titleSource` is `placeholder`.