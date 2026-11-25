# Cloud Agent

A JavaScript GitHub-only workspace: React, React Router (not `react-router-dom`),
Redux Toolkit, Axios, Tailwind CSS, Express, Passport.js, and MongoDB.
The backend runs in Docker Desktop Kubernetes; Vite runs on the host.

## Requirements

- Node.js 20.19+ (or 22.12+) and npm.
- Docker Desktop with Kubernetes enabled and `kubectl` targeting `docker-desktop`.
- An existing NGINX ingress controller with ingress class `nginx`, exposed on
  `http://localhost:80`. These manifests do **not** install a controller or MongoDB.
- Reachable MongoDB and the existing GitHub App.

## Configure GitHub

For the GitHub App **exlantern**, set:

| Setting | Value |
| --- | --- |
| User authorization callback URL | `http://localhost:5173/api/v1/auth/github/callback` |
| Setup URL (after installation) | `http://localhost:5173/api/v1/auth/github/install/callback` |
| Webhook URL | `https://36l2d8v4-5173.inc1.devtunnels.ms/api/v1/webhook/github/event` |

Use the GitHub **App's client ID and client secret**, not credentials from a
separate OAuth App. The app ID is numeric; the installation URL uses the **slug**
`exlantern`, not the numeric ID. Disable **Request user authorization (OAuth)
during installation**: this app explicitly starts its own browser-bound OAuth
verification after the Setup URL callback. Installation requests that require
organization approval must be approved before completing connection.

Subscribe to the webhook events you want to see (for example push and pull
request), grant the corresponding minimum repository permissions, and enable
the app's webhook. Installation lifecycle events update connection status.
The app verifies an installation using the signed-in GitHub user's
`/user/installations` API. To list its repositories, generate a GitHub App
private key and configure `GITHUB_APP_PRIVATE_KEY`. For a locally run backend,
use a PEM string with literal `\n` sequences in `.env`. For Kubernetes, use
the separate Secret described below. The repository endpoint returns 503 if the
key is missing or invalid; other features remain available.
This scaffold does not clone code, start agents, process payments, or replay events.

## Install and configure

```sh
npm --prefix backend ci
npm --prefix frontend ci
```

The existing `backend/.env` is intentionally preserved. Add any missing keys
using `backend/.env.example` as the reference. If no file exists, copy the example
first. Do not copy over existing credentials. Generate **two different** token
secrets using `openssl rand -hex 32`, one for each secret. All GitHub credentials
and MongoDB/token secrets are backend-only; never use `VITE_` for these values.

For MongoDB running on the host, a pod generally needs
`mongodb://host.docker.internal:27017/cloud-agent`, not `127.0.0.1`.
Use an externally reachable URI or a dedicated MongoDB service if appropriate.
Ensure MongoDB network access and authentication are configured for that URI.

## Deploy the backend

Keep `k8s/secret.yaml` as a **placeholder-only template**. Copy it to the ignored
`k8s/secret.local.yaml`, fill in all seven secret values locally, and never commit
the filled file. Kubernetes Secrets are base64-encoded, not automatically
encrypted at rest; use a proper secret manager for real deployments.

```sh
cp k8s/secret.yaml k8s/secret.local.yaml
# Edit k8s/secret.local.yaml locally.
# Substitute the path to your GitHub App private key without committing it.
kubectl --context docker-desktop create secret generic cloud-agent-github-key \
  --from-file=GITHUB_APP_PRIVATE_KEY=backend/path-to-private-key.pem \
  --dry-run=client -o yaml | kubectl --context docker-desktop apply -f -
docker build -t cloud-agent-backend:local backend
kubectl --context docker-desktop apply -f k8s/secret.local.yaml
kubectl --context docker-desktop apply -f k8s/deployment.yaml -f k8s/service.yaml -f k8s/ingress.yaml
kubectl --context docker-desktop rollout status deployment/cloud-agent-backend
curl http://localhost/api/v1/health/ready
```

The backend uses `imagePullPolicy: IfNotPresent` so Docker Desktop's kind nodes
can retrieve locally built images through Docker Desktop's image mirror.
`Never` would prevent that first retrieval on a node. On other local clusters
without image sharing, load the image into each node's image store first.
After rebuilding the same image tag, run
`kubectl --context docker-desktop rollout restart deployment/cloud-agent-backend`.
Restart the deployment after updating the GitHub App private key Secret too.

The manifests intentionally use `NODE_ENV=development` for your HTTP localhost
setup, so cookies are not marked Secure. This is **not** a production deployment:
for production use HTTPS, `NODE_ENV=production`, the correct `FRONTEND_ORIGIN`,
a same-origin production reverse proxy, TLS ingress, and managed secrets.
Update app callback URLs as well. Vite's dev proxy is not a production server.

## Automatically redeploy backend changes with Skaffold

Install Skaffold v2.25+ (`brew install skaffold` on macOS), then run these commands
from this directory after filling in `k8s/secret.local.yaml`:

```sh
kubectl --context docker-desktop apply -f k8s/secret.local.yaml
skaffold dev --cleanup=false
```

Keep `skaffold dev` running in a terminal while editing the backend. It builds
the initial image, deploys the backend/service/ingress, and watches the Docker
build inputs: `backend/src/`, `backend/package.json`, `backend/package-lock.json`,
and `backend/Dockerfile`. On each change it rebuilds a content-tagged image and
updates the Deployment, so Kubernetes rolls out a new pod with the latest code.
Dependency layers are cached when package files have not changed. Build or
readiness failures are reported in the terminal; an unsuccessful rebuild does
not replace the running image.

This deliberately uses image rebuilds rather than copying files into running
containers: the existing read-only filesystem and production start command
remain unchanged. Changes to tests, documentation, `.env`, or `node_modules`
do not trigger builds because they are not image inputs. Vite continues running
outside Kubernetes in its own terminal.

Skaffold targets `docker-desktop`, builds locally without pushing code to a
registry, and replaces the Deployment's image tag automatically. Do not run
manual image builds or rollout restarts during this loop. With `--cleanup=false`,
Ctrl+C stops watching but leaves the deployed application running. To remove
Skaffold-managed resources explicitly, run `skaffold delete`.

Secrets are intentionally excluded from Skaffold's manifest list, so neither the
placeholder template nor your filled local secrets are rendered, watched, or
deleted by Skaffold. After changing secrets, apply the local secret again and
restart the Deployment to refresh its environment variables.

## Start the frontend outside Kubernetes

```sh
cd frontend
npm run dev
```

Open **http://localhost:5173** (not 127.0.0.1). Vite preserves the lowercase
`/api` path and proxies only to `http://localhost`, with **no CORS**:

```js
server: {
  port: 5173,
  strictPort: true,
  proxy: { '/api': { target: 'http://localhost', changeOrigin: false } }
}
```

Expose port 5173 through the configured VS Code development tunnel and allow
anonymous tunnel access for the **webhook route** so GitHub can deliver requests.
The webhook endpoint authenticates every delivery by its HMAC SHA-256 signature.
Do not use the tunnel origin for interactive login: OAuth redirects intentionally
use localhost. If the tunnel hostname changes, update the GitHub webhook setting
and Vite's explicit `allowedHosts` entry.

## Authentication and installation

1. **Continue with GitHub** starts the single register/login flow. A ten-minute
   signed, httpOnly, SameSite=Lax cookie binds OAuth state to this browser.
2. Passport exchanges the code. The controller creates or finds a GitHub identity
   and checks installation access with GitHub. No email or password is collected.
3. If not installed, the browser goes directly to
   `https://github.com/apps/exlantern/installations/new`. An independent signed
   state cookie binds the return to this account.
4. The Setup URL callback starts GitHub OAuth again (usually already authorized).
   The backend checks that the same GitHub account can access that exact
   installation **and** that its app ID matches. Callback query parameters alone
   are not trusted. Cancelling leaves the installation pending; sign in again
   to resume.
5. The backend sets a seven-day httpOnly SameSite=Strict refresh cookie scoped to
   `/api/v1/auth`, then redirects to `/auth/callback`. The frontend obtains a
   15-minute bearer access token using `/auth/refresh`.

Access tokens stay only in Redux memory, never localStorage or URLs. Only the
SHA-256 refresh-token hash is persisted. Refresh rotation uses an atomic
compare-and-swap, preventing replay and concurrent reuse; client refreshes are
single-flight within a tab. One current refresh session per account is supported:
signing in elsewhere replaces the previous refresh token, and simultaneous
refresh across separate tabs may require signing in again. Logout revokes refresh
and clears its cookie; an already-issued access token expires within 15 minutes.
No third-party GitHub access tokens are stored. Lifecycle webhooks keep
installation status current; access revocation without a delivered webhook is
only detected on the next verified GitHub login.

## Structure

```text
backend/src/
  config/ types/ models/ DAO/ utils/ validators/
  middleware/ controller/ routes/ services/
  app.js server.js
frontend/src/
  app/                 # store and routing
  shared/              # Axios transport, session hook, UI primitives
  features/
    auth/              # api/, state/, hooks/, ui/
    activity/          # api/, state/, hooks/, ui/
    connection/        # api/, state/, hooks/, ui/
    overview/ui/       # composes existing feature hooks; no duplicate data layer
k8s/
  ingress.yaml deployment.yaml service.yaml secret.yaml
```

Backend flow is **routes → controllers → DAO → models**. `services/github.service.js`
is only a third-party HTTP integration, not application business logic.
JavaScript and JSDoc intentionally replace the skill's TypeScript defaults.
Password validators, password hashing, and password registration endpoints are
intentionally absent. Request logs omit query strings to avoid leaking OAuth
codes/state, rather than using Morgan's stock URL-bearing formats.

## API

All JSON responses use exactly one envelope:

```json
{"success":true,"message":"Profile retrieved","data":{"user":{"id":"...","githubId":"123","username":"octocat","name":"Octocat","avatarUrl":"https://avatars.githubusercontent.com/u/123","installationId":12345,"installationStatus":"active","installationAccount":"octocat","createdAt":"2026-01-01T00:00:00.000Z"},"githubAppSlug":"exlantern"}}
```

```json
{"success":false,"message":"Authentication required","errors":[]}
```

```json
{"success":false,"message":"Validation failed","errors":[{"field":"installation_id","message":"Invalid installation ID"}]}
```

Failure stacks are included only outside production. OAuth endpoints return HTTP
redirects on success, not JSON envelopes. GETs have no request body; mutation
endpoints below take an empty body unless specified.

| Method | Path | Request | Success |
| --- | --- | --- | --- |
| GET | `/api/v1/auth/github` | Browser navigation | 302 GitHub authorization |
| GET | `/api/v1/auth/github/callback` | `?code=...&state=...` and state cookie | 302 installation or frontend |
| GET | `/api/v1/auth/github/install/callback` | `?installation_id=123&state=...` and state cookie | 302 OAuth verification |
| POST | `/api/v1/auth/refresh` | Refresh cookie | `{"success":true,"message":"Session refreshed","data":{"accessToken":"...","user":{},"githubAppSlug":"exlantern"}}` (user has all public fields shown above) |
| POST | `/api/v1/auth/logout` | Bearer token and refresh cookie | `{"success":true,"message":"Logged out successfully","data":{}}` |
| GET | `/api/v1/auth/me` | Bearer token | Profile envelope shown above |
| POST | `/api/v1/auth/github/connect` | Bearer token | `{"success":true,"message":"GitHub installation URL created","data":{"url":"https://github.com/apps/exlantern/installations/new?state=..."}}}` |
| GET | `/api/v1/activity` | Bearer token | `{"success":true,"message":"Activity retrieved","data":{"events":[]}}` |
| GET | `/api/v1/task/github/repos` | Bearer token; active installation | `{"success":true,"message":"GitHub repositories retrieved","data":{"repositories":[{"id":123,"name":"project","fullName":"owner/project","private":true,"htmlUrl":"https://github.com/owner/project","defaultBranch":"main"}]}}` |
| POST | `/api/v1/webhook/github/event` | Original GitHub JSON + signature/delivery/event headers | `{"success":true,"message":"Webhook received","data":{"deliveryId":"..."}}` |
| GET | `/api/v1/health/live` | None | `{"success":true,"message":"Server is running","data":{"status":"ok"}}` |
| GET | `/api/v1/health/ready` | None | `{"success":true,"message":"Server is ready","data":{"status":"ready"}}` |

Activity is installation-scoped, contains only delivery summaries (not code or raw
payloads), is capped at the latest 50 events, and expires after 30 days via MongoDB
TTL. Duplicate delivery IDs are idempotent.

The repository endpoint creates a short-lived installation token and returns all
pages of repositories available to the user's connected installation (including
private repositories). It returns 409 when the installation is not active and
502 when GitHub cannot provide the list. An installation token reflects the
app's installation permissions, not the signed-in user's current repository
permissions: users whose access was revoked may retain access until they next
sign in or a relevant installation lifecycle webhook is processed. Do not use
this endpoint where current per-user GitHub authorization is required.

## Agent and workshop containers

The agent and workshop share a volume mounted at `/workshop`. The agent edits
files there, but its `run_command` tool sends HTTP requests to
`http://workshop:4000/commands`; commands execute in the **workshop container**,
not in the agent container. The server lives in `pod/workshop` and runs as the
non-root `node` user, with its source outside the shared volume at `/server`.

Start just the command server, or both containers:

```sh
docker compose -f pod/compose.yaml up --build -d workshop
# Configure pod/agent/.env with the agent's model credentials before starting it.
docker compose -f pod/compose.yaml up --build
```

Agent events are JSON stored in the `event` field of Redis stream `task:<TASK_ID>`.
Each event contains `agent` (`planner`, `main`, or `test`) and `content`.
Model text, tool calls, and reasoning (when supplied by the provider) come from
the latest model message; final structured fields such as `plan` and `tasks`
come from the agent state. Tool-result updates do not emit empty placeholder
events. Each Redis write is awaited, and write failures fail the agent run.

Model-facing tool arguments use required, nullable fields for strict schema
validation. Pass `null` to use listing or command defaults. For `update_files`,
provide both `content` and `edits` on each file and set the unused field to `null`.

Port 4000 is internal to the Compose network, not published on the host. From
a client on that network:

```sh
curl -sS http://workshop:4000/health
curl -sS http://workshop:4000/commands \
  -H 'Content-Type: application/json' \
  -d '{"command":"npm test","cwd":"my-repository","timeoutMs":120000}'
```

`POST /commands` accepts a Bash `command`, optional `cwd` relative to `/workshop`
(default `"."`), and optional `timeoutMs` (default 120000). The working directory
must exist and resolve inside `/workshop`, including through symlinks. Each
request starts a fresh shell; `cd` and exported variables do not persist.

Responses have the form:

```json
{"success":true,"data":{"exitCode":0,"signal":null,"output":"tests passed\n","timedOut":false,"truncated":false,"durationMs":42,"cwd":"my-repository"}}
```

Output combines stdout and stderr from separate pipes (their relative ordering
is not guaranteed), removes ANSI escapes, and normalizes newlines. Commands run
without a terminal or interactive stdin, so terminal-dependent programs may
behave differently. A nonzero command exit is still HTTP 200;
inspect `exitCode` and `timedOut` to determine command success. Timeouts kill
the shell's process group and return `exitCode: null`. Invalid requests return
4xx with `{"success":false,"message":"..."}`; unexpected server errors return 500.

Server environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP listen port on all interfaces |
| `WORKSHOP_DIR` | `/workshop` | Shared workspace root |
| `DEFAULT_TIMEOUT_MS` | `120000` | Timeout when omitted by the client |
| `MAX_TIMEOUT_MS` | `600000` | Largest accepted timeout; minimum request timeout is 1000 |
| `MAX_OUTPUT_BYTES` | `1000000` | Captured output byte limit; remaining output is discarded |
| `MAX_CONCURRENT_COMMANDS` | `4` | Active command limit; excess requests return 429 |

Keep the default timeout at or below the maximum. JSON request bodies are
limited to 64 KiB, and commands to 10000 characters. The agent's
`WORKSHOP_SERVER_URL` defaults to `http://workshop:4000`; use
`http://127.0.0.1:4000` when the containers share a Kubernetes pod network.

**Isolation boundary:** this API intentionally executes arbitrary shell commands
and has no authentication. Do not publish it publicly or attach untrusted
clients. Working-directory validation is not a filesystem sandbox: repository
code can access anything available to the workshop user, including its network.
Keep agent credentials, host mounts, and the Docker socket out of the workshop
container. The shared volume is also writable by repository code, so the agent
must treat its contents as untrusted. Container separation alone is not a
complete sandbox for hostile workloads.

Verify the server and its agent client:

```sh
npm --prefix pod/workshop test
npm --prefix pod/agent test
```

## Design and verification

The UI follows the Google Stitch **Cloud Agent** project: monochrome surfaces,
flat muted status colors, generous whitespace, sidebar navigation, and separate
sign-in, overview, activity, and connection pages.
[Open the Stitch project](https://stitch.withgoogle.com/projects/10327554313593876902).
Stitch also suggested repository-selection, replay/debugging, and dark-mode
design extensions; these are not implemented or implied by this scaffold.

```sh
npm --prefix backend run check
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

Backend integration tests require `TEST_MONGODB_URI` pointing at a **disposable
MongoDB instance**. Tests use an isolated database name and remove that database
afterward; they never read real GitHub credentials from `.env`.
Without `TEST_MONGODB_URI`, DB integration cases are explicitly skipped.
Unit/HTTP tests still exercise JWT purpose separation, state and signature
rejection, response envelopes, validation, and error handling.
