# Microservices split, private deployment & PactFlow contract testing

Status: **plan** (decision record for the move from a single compose monorepo to
independently-deployable services). This complements `docs/contract-testing.md`,
which describes the current *local-directory, no-broker* setup. The target below
replaces the broker part. For the exact *when* of each pact step (publish vs
verify triggers, and what the submodule split breaks), see
`docs/contract-testing-triggers.md`.

## Goal

Split the current folders (`auth`, `auth-ui`, `prototype`, `frontend`, ...) into
**separate open-source repositories** that each build & deploy independently,
while:

- Source code, Dockerfiles, CI and the **Pact contract JSON files stay open source**.
- **Deployment stays private** (our own Docker Swarm server).
- We keep an **umbrella monorepo using git submodules for local development only**
  (it is *not* used to deploy).

## Guiding principle: separate *code* (public) from *deployment* (private)

Open source only constrains the **source code**. The server, secrets, and swarm
config never have to be public. Crucially:

> The private server never builds from the public repos. It pulls pre-built
> images from a registry and injects secrets at deploy time.

```
public repos (open source)              private (our server / private repos)
──────────────────────────              ─────────────────────────────────────
auth/        ──CI build──┐
frontend/    ──CI build──┼─► REGISTRY  ◄── docker stack deploy ── private server
auth-ui/     ──CI build──┘   (images)                            (swarm secrets/env)
deploy/stack.yml ─► PRIVATE repo (infra, not open source)
```

Registry choice: **public images are acceptable** (per decision). Images can go
to a public registry (e.g. public GHCR image, Docker Hub). Secrets still never
enter the image or git.

## Public vs private — what belongs where

| Thing | Public / open source? | Notes |
|-------|-----------------------|-------|
| Service source + Dockerfile + CI | ✅ public | each service = own repo |
| Pact contract JSON files | ✅ **public** (decision) | API shapes are not secret |
| Built images (registry) | ✅ public registry OK | secrets never baked in |
| `stack.yml` / swarm config | 🔒 private repo | infra, references images only |
| Secrets / env values | 🔒 server only | `docker secret`, gitignored |
| Umbrella repo (git submodules) | ✅ public | **dev-only**, not used to deploy |

## Repository layout (target)

- One repo per service: `auth`, `auth-ui`, `prototype`, `frontend`, ...
  - each keeps its own `Dockerfile`, unit tests, consumer/contract tests, CI.
- One **private** `deploy` repo: holds `stack.yml` + swarm secrets. Not open source.
- One **umbrella** monorepo (this one) using git submodules → local dev only.

```bash
# umbrella repo = convenience aggregator, never used to deploy
git submodule add git@github.com:YOURORG/auth.git auth
git submodule add git@github.com:YOURORG/frontend.git frontend
git submodule add git@github.com:YOURORG/auth-ui.git auth-ui
# existing root docker-compose.yml (build: + develop.watch) keeps working for local dev
```

## Per-service CI pipeline (public)

On each push / release, public CI runs:

1. Unit tests.
2. Consumer-side contract tests (for consumers, e.g. `frontend`).
3. Provider-side verification (for providers, e.g. `auth`) — see Pact section.
4. Build Docker image → push to public registry, tagged by git SHA.

Release gate (public): a service can cut a release only if unit + contract
tests pass. `can-i-deploy` is checked later, in the **private** deploy step.

## Private deployment (Docker Swarm)

`stack.yml` (private repo) references images, never source:

```yaml
services:
  auth:
    image: YOURREGISTRY/auth:latest
    ports: ["8080:8080"]
    environment:
      - LOG_LEVEL=INFO
    secrets: [auth_env]
secrets:
  auth_env:
    external: true
```

On the server (one-time):

```bash
docker swarm init
docker secret create auth_env ./secrets/auth.env   # file is gitignored, on server only
```

Deploy:

```bash
# can-i-deploy gate first (see Pact section), then:
docker stack deploy -c stack.yml giapha
```

Note: current `docker-compose.yml` uses `build:` for local dev; the swarm
`stack.yml` replaces `build:` with `image:`. Both coexist.

## Pact contract testing with PactFlow (target)

Move from the current local-directory/no-broker setup to **PactFlow** as a
central broker. PactFlow is a managed broker that is **always token-gated**, so
"private broker" is just its default nature.

### Two independent axes (this is what makes it work)

| Axis | Choice | How |
|------|--------|-----|
| Broker (PactFlow) | private | always token-gated |
| CI jobs (GH Actions) | can be **public** | PactFlow URL + token stored as Actions **secrets** (never exposed) |

Because the **contract JSON is open source**, there is no leak concern from
running tests/verification in public CI. The only thing to keep secret is the
**PactFlow token**, which GitHub Actions hides.

### Consumer side (e.g. frontend, auth-as-consumer) — public CI

```bash
# run pact tests (generates pacts/) — public
pnpm test:contracts
# publish to PactFlow (token is an Actions secret) — public job, private broker
pact-broker publish ./pacts \
  --consumer-app-version $GIT_SHA \
  --broker $PACT_BROKER_URL --token $PACT_BROKER_TOKEN
```

The public Pact files can stay in git too (decision), so `frontend/pacts/`,
`auth/contracts/` remain committed for the local stub-server/demo.

### Provider side (e.g. auth) — public CI

The provider does **not** hardcode which consumers use its API — the broker
knows the provider↔consumer graph and the verifier pulls all relevant pacts:

```bash
pact-verifier \
  --provider=auth --provider-app-version $GIT_SHA \
  --provider-base-url http://localhost:8080 \
  --pact-broker-url $PACT_BROKER_URL --pact-broker-token $PACT_BROKER_TOKEN \
  --consumer-version-selectors '{"latest":true}' \
  --publish-verification-results
```

Set up a **PactFlow webhook → GitHub `repository_dispatch`** so publishing a new
consumer pact auto-triggers the provider's public verification workflow.

### Release / deploy gate — `can-i-deploy` (private deploy)

Be precise about what proves what:

- Consumer tests passing only proves it *recorded* expectations.
- The hard gate = **provider verification** across consumers + **`can-i-deploy`**.
- `can-i-deploy` runs in the **private** deploy pipeline (read-only token), and
  `prod` is tagged there (only the deploy knows what's actually running):

```bash
# private deploy pipeline, before docker stack deploy
pact-broker can-i-deploy --pacticipant auth --version $GIT_SHA \
  --to prod \
  --broker $PACT_BROKER_URL --token $PACT_BROKER_READ_TOKEN
# gate passes → docker stack deploy → then record prod:
pact-broker create-version-tag --pacticipant auth --version $GIT_SHA --tag prod \
  --broker $PACT_BROKER_URL --token $PACT_BROKER_TOKEN
```

### End-to-end wiring

```
[public CI: frontend (consumer)] unit + consumer-tests → pact publish (token secret) ─┐
                                                                                      ├─► PactFlow (private broker)
[public CI: auth (consumer)]     unit + consumer-tests → pact publish ───────────────┘        │
                                                                                              │ webhook → repository_dispatch
                                                                                              ▼
[public CI: auth (provider)]  pact-verifier pulls from broker → verify → publish results ─────┘

[PRIVATE deploy repo/server] can-i-deploy (read token) → docker stack deploy → tag prod
```

## Open decisions / next steps

- [ ] Pick public registry (GHCR public image vs Docker Hub) and naming scheme.
- [ ] Create the PactFlow account + a tenant; create fine-grained tokens
      (publish vs read-only for `can-i-deploy`).
- [ ] Decide the PactFlow webhook → `repository_dispatch` PAT scope.
- [ ] Create the private `deploy` repo with `stack.yml` + swarm secrets.
- [ ] Convert each service folder into its own repo; add publish + verify workflows.
- [ ] Turn this monorepo into an umbrella of submodules (dev-only), keep root
      `docker-compose.yml` for local dev.
- [ ] Update `docs/contract-testing.md` to describe the PactFlow setup once migrated.
