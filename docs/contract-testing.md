# Contract testing (Pact)

Contract tests pin down the HTTP APIs used by the **login** and **register**
pages (`/api/passkey/registerStart`, `/api/passkey/registerFinish`,
`/api/passkey/loginStart`, `/api/passkey/loginFinish`) between the
`frontend` (consumer) and `auth` (provider).

```
frontend consumer tests ──> pacts/*.json ──> Pact Broker ──> auth provider verification
                                   │
                                   └──> stub server (demo mode)
```

## Prerequisites (once per machine)

```bash
# Pact FFI library, needed by the Go provider verification
bash contracts/install-pact-ffi.sh

# Pact Broker (OSS, local) - UI at http://localhost:9292
docker compose up -d pact-broker
```

## Consumer side (frontend)

```bash
cd frontend
pnpm test:contracts     # runs pact tests, writes frontend/pacts/
pnpm pact:publish       # pact CLI: publishes pacts/ to the broker
                        # (PACT_BROKER_BASE_URL, default http://localhost:9292;
                        # version + branch auto-detected from git/CI)
```

The tests drive the real client code (`src/services/passkey.ts`) against a
Pact mock provider. `@simplewebauthn/browser` is mocked with the fixtures
from `contracts/fixtures/` (see "Fixtures" below), and a small cookie jar
emulates the browser's handling of the `sid` cookie.

## Provider side (auth)

```bash
cd auth
go test ./contracts/ -v
```

- Without `PACT_BROKER_URL`: verifies `frontend/pacts/*.json`.
- With `PACT_BROKER_URL` (+ optional `PACT_BROKER_TOKEN` /
  `PACT_BROKER_USERNAME` / `PACT_BROKER_PASSWORD`): fetches the latest
  `frontend` pacts from the broker and publishes the verification results.

Provider states seed the in-memory session/user repositories so the WebAuthn
`finish` endpoints can be verified for real: the seeded session carries the
fixture challenge and the seeded user carries the fixture COSE public key,
so the recorded attestation/assertion pass go-webauthn's cryptographic
checks.

## Fixtures

`contracts/fixtures/{params,attestation,assertion}.json` are cryptographically
valid WebAuthn payloads shared by both sides. Regenerate them after changing
the RP id/origin or algorithm support:

```bash
node contracts/generate-fixtures.mjs
cd auth && go run ./cmd/fixture-smoke   # sanity-check against go-webauthn
```

Then re-run consumer tests and provider verification.

## Running the frontend: demo vs live

| Mode | Command | Backend | Env file |
|---|---|---|---|
| **demo** (backend not ready) | `docker compose up -d frontend-demo` | pact stub server (see Docker Compose below) | `frontend/.env.demo` |
| **live** (real backend) | `pnpm dev` | real `auth` service on `:8080` | `frontend/.env.development` |

In demo mode the frontend is built with an empty `VITE_AUTH_BACKEND_URL`, so
all calls are same-origin `/api/` requests proxied to the pact stub server,
which returns the contract's example responses. The register and login flows
therefore work end-to-end in the browser without the Go backend.

For production builds, set `VITE_AUTH_BACKEND_URL` at build time (live mode).

## Docker Compose (demo vs live)

| Service | Port | Talks to |
|---|---|---|
| `frontend` (live) | 8083 | real `auth` service (`VITE_AUTH_BACKEND_URL=http://localhost:8080`, baked at build time) |
| `frontend-demo` (demo) | 8084 | pact stub server, via its nginx proxying `/api/` to `stub-server:8090` (built with `VITE_AUTH_BACKEND_URL=""`) |
| `stub-server` | 8090 | official `pactfoundation/pact-stub-server` image, serving all latest pacts from the Pact Broker (`-b http://pact-broker:9292`) |

Notes:

- Publish pacts to the broker first (`pnpm pact:publish`); the stub loads them
  at startup.
- The stub image ships without ca-certificates, so `/etc/ssl/certs` is mounted
  into it (otherwise it panics when fetching from the broker).
- `frontend-demo` calls the stub same-origin because the official stub
  server cannot do credentialed CORS (`Access-Control-Allow-Credentials`),
  and the login flow needs `credentials: 'include'` for the `sid` cookie.

## CI

- `frontend-ci.yml`: `contracts` job runs `pnpm test:contracts`, publishes to
  the broker on `main` when the `PACT_BROKER_URL`/`PACT_BROKER_TOKEN` secrets
  are set, and uploads the pacts as an artifact.
- `auth-ci.yml`: `pact-verify` job installs the Pact FFI and verifies the
  broker pacts (or local pacts when no broker is configured).
