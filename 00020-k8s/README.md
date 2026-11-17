# Express on Kubernetes

The project contains these folders:

```text
00020-k8s/
  server/             Express app, tests, and Dockerfile
  k8s/                Deployment, Service, and Ingress manifests
    deployment.yaml
    service.yaml
    ingress.yaml
```

This is a stateless demo: dummy users/products are fixed, and the echo endpoint
does not store data. No database or authentication is required.

## Run locally

Use Node.js 22+ and run from the `00020-k8s` project folder:

```sh
cd server
npm ci
npm test
npm start
```

The server listens on port 3000; set `PORT` to override it.

## Deploy with Docker Desktop Kubernetes (kind)

In Docker Desktop, enable the containerd image store and enable Kubernetes with
the **kind** provisioner. Wait for Kubernetes to be running. The containerd image
store lets this local cluster use images built by Docker Desktop.

Run the following from the `00020-k8s` project folder (use `cd ..` first if you
are still in `server`). Every Kubernetes command explicitly
targets `docker-desktop` so an unrelated current context is not used.

### 1. Install the Ingress controller (once per cluster)

An Ingress is only a routing rule; an Ingress controller must run in the cluster
to receive traffic and apply that rule. This project uses the maintained
[F5 NGINX Ingress Controller](https://docs.nginx.com/nginx-ingress-controller/)
(the community `ingress-nginx` controller was retired in March 2026).

```sh
helm --kube-context docker-desktop install nginx-ingress \
  oci://ghcr.io/nginx/charts/nginx-ingress --version 2.8.1 \
  --namespace nginx-ingress --create-namespace --wait --timeout 5m
kubectl --context docker-desktop get ingressclass
kubectl --context docker-desktop -n nginx-ingress get pods,services
```

The chart creates the `nginx` IngressClass and a `LoadBalancer` Service on ports
80 and 443. Docker Desktop's kind cluster publishes `LoadBalancer` Services on
your Mac, so the controller receives requests sent to `http://localhost`. Port 80
must be free on your Mac.

### 2. Build and deploy the app

```sh
docker --context desktop-linux build -t dummy-express:1.0.0 ./server
kubectl --context docker-desktop get nodes
kubectl --context docker-desktop -n default apply -f k8s/deployment.yaml -f k8s/service.yaml -f k8s/ingress.yaml
kubectl --context docker-desktop -n default rollout status deployment/dummy-express --timeout=120s
kubectl --context docker-desktop -n default get pods,services,ingress -l app=dummy-express
```

Open <http://localhost>. Requests flow like this:

```text
Mac localhost:80
  -> nginx-ingress-controller Service (LoadBalancer)
  -> NGINX Ingress Controller pod (applies k8s/ingress.yaml)
  -> dummy-express Service (ClusterIP, port 80)
  -> dummy-express pods (port 3000, 2 replicas)
```

The app's Service stays `ClusterIP` (internal only); the Ingress controller is
the single entry point. F5 NGINX requires a `host` on each Ingress rule, so the
rule matches the `Host: localhost` header. Use `http://localhost`, not
`http://127.0.0.1`; unmatched hosts receive NGINX's 404 page. If
`kubectl get events` shows `Rejected` for the Ingress, check the rule's `host`.

If pods report `ImagePullBackOff`, confirm the containerd image store is enabled
and rebuild the image using the Docker Desktop context above. For a remote
cluster, push the image to your registry and update `image` in
[deployment.yaml](./k8s/deployment.yaml).

After changing server code, build a new image tag and update the Deployment's
`image` tag before applying again.

## Dummy APIs

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | Greeting |
| GET | `/health` | `{"status":"ok"}` (used by Kubernetes probes) |
| GET | `/api/users` | Three dummy users in `data` |
| GET | `/api/users/1` | One dummy user in `data`; unknown IDs return 404 |
| GET | `/api/products` | Two dummy products in `data` |
| POST | `/api/echo` | Submitted JSON in `data`; nothing is persisted |

```sh
curl http://localhost/health
curl http://localhost/api/users
curl http://localhost/api/products
curl -X POST http://localhost/api/echo \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello Kubernetes"}'
```

When running directly with `npm start`, use `http://localhost:3000` instead.

## Remove the demo

```sh
kubectl --context docker-desktop -n default delete -f k8s/ingress.yaml -f k8s/service.yaml -f k8s/deployment.yaml
```

To also remove the Ingress controller and free port 80:

```sh
helm --kube-context docker-desktop uninstall nginx-ingress --namespace nginx-ingress
kubectl --context docker-desktop delete namespace nginx-ingress
```
