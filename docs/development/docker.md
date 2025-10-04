# Docker Development Guide

This guide summarizes the container workflows supported by the project so automation agents can get the UI running quickly inside Docker.

## Production-like container (`make docker-run`)

Use `make docker-run` to build the production image and run it locally.

```bash
make docker-run
```

This target wraps two steps:

1. `docker build -t wake-time-calculator:latest .` – creates an Nginx-based image that serves the static application from `/usr/share/nginx/html`.
2. `docker run -d -p 8080:80 --name wake-time-calculator wake-time-calculator:latest` – launches the container in detached mode.

### Ports and health check

- **Port mapping:** The container listens on port `80` internally and is published to `localhost:8080`.
- **Health check:** Docker uses `wget --spider http://localhost:80` inside the container to verify readiness every 30 seconds.
- **Verification:** After the container is healthy, open `http://localhost:8080` in a browser (or forward the port in your workspace) to view the app.

### Related commands

- Stop and clean up the container when you are done: `make docker-stop`.
- Stream logs from the running container (Nginx access/error logs): `docker-compose logs app` or `make docker-logs`.

## docker-compose workflow (`docker-compose up app`)

If you prefer `docker-compose`, start just the `app` service:

```bash
docker-compose up app
```

- Compose uses the same build context as `make docker-run`, exposing the UI on `localhost:8080`.
- The `app` service inherits the same health check (`wget --spider http://localhost:80`) that reports status in the Compose output.
- Use `docker-compose logs app` for focused log streaming.
- Shut everything down with `make docker-stop` or `docker-compose down`.

## Development server container (`dev` service)

For a live-reload friendly development environment, run the lightweight Python HTTP server defined in the `dev` service:

```bash
make docker-dev
# or
docker-compose up dev
```

- **Image:** `python:3.11-alpine`.
- **Working directory:** `/app/src`, mounted from the repository via `.:/app` so local edits appear instantly.
- **Port mapping:** Internal port `8000` is published to `localhost:8000`.
- **Command:** `python3 -m http.server 8000` serves the raw ES module files without a build step.
- **Health check:** Compose polls `http://localhost:8000` with `wget --spider` to confirm the server is serving content.

Navigate to `http://localhost:8000` once the service reports `healthy` to load the development version.

## Codex-specific notes

- Codex web workspaces **do not** require launching the Playwright containers (`playwright` / `playwright-visual`) unless you are running the full end-to-end suites. `make docker-run` or `docker-compose up dev` is enough for manual testing and UI validation.
- Use `make docker-stop` to clean up both standalone Docker and Compose containers before handing control back to automation.
- `docker-compose logs -f` provides tailing output for any service (e.g., `app`, `dev`) when debugging startup issues in automated environments.

