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
pnpm pact:publish       # publishes pacts to PACT_BROKER_URL (tagged with the branch)
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
| **demo** (backend not ready) | `pnpm demo` | Pact stub server on `:8090` built from the contracts | `frontend/.env.demo` |
| **live** (real backend) | `pnpm dev` | real `auth` service on `:8080` | `frontend/.env.development` |

`pnpm demo` starts the stub server (`contracts/stub-server.mjs`, which serves
the example interactions from `frontend/pacts/`) and Vite in `demo` mode
together. The stub returns the contract's example responses, so the register
and login flows work end-to-end in the browser without the Go backend.

For production builds, set `VITE_AUTH_BACKEND_URL` at build time (live mode).

## CI

- `frontend-ci.yml`: `contracts` job runs `pnpm test:contracts`, publishes to
  the broker on `main` when the `PACT_BROKER_URL`/`PACT_BROKER_TOKEN` secrets
  are set, and uploads the pacts as an artifact.
- `auth-ci.yml`: `pact-verify` job installs the Pact FFI and verifies the
  broker pacts (or local pacts when no broker is configured).
