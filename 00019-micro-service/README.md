# Payment and course microservices

Requires Docker with Docker Compose. From this directory, build and start both
services and the Caddy API gateway:

```sh
docker compose up --build -d
```

The gateway is available at `http://localhost:8080`. To use another host port,
run `GATEWAY_PORT=8085 docker compose up --build -d`.

| Route | Internal upstream |
| --- | --- |
| `/api/payment/*` | `payment:3000` |
| `/api/course/*` | `course:3001` |

Caddy preserves the complete request path. The services communicate over the
default Compose network and do not publish their ports to the host. Unmatched
gateway paths return HTTP 404. This local setup uses HTTP, not HTTPS.

Test the existing endpoints:

```sh
curl -X POST http://localhost:8080/api/payment/verify
# Payment verification endpoint

curl -X POST http://localhost:8080/api/course/enroll
# Course enrollment endpoint
```

View logs or stop the stack:

```sh
docker compose logs -f
docker compose down
```
