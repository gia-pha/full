# Contract test triggers (after the split to submodules)

Companion to `docs/microservices-deployment-plan.md` (target architecture) and
`docs/contract-testing.md` (how to run the tests locally). This file answers two
questions only: **when does a consumer publish a pact**, and **when does a
provider verify against all consumers**.

Rule of thumb: publishing and verifying run on **two independent clocks**, and
after the split **neither clock may live in the umbrella repo** — each repo runs
its own CI, and a repo can no longer see any other repo's files.

## 1. Consumer: when to publish

Applies to consumers (`frontend`, `auth` when it consumes another service).

| Event | CI does | Broker effect |
|-------|---------|---------------|
| PR opened/updated | runs pact consumer tests, uploads pacts as an artifact | none |
| Merge to `main` | pact tests → `pact-broker publish` | new pact version on branch `main` |
| Release tag | publish + tag the version | pinned version |
| Push to the umbrella repo (gitlink bump) | **no pact work at all** | none |

```bash
# consumer repo, after `pnpm test:contracts` is green, only on the default branch
pact-broker publish ./pacts \
  --consumer-app-version "$GIT_SHA" \
  --branch "$GIT_BRANCH" \
  --auto-version-commit-shas \
  --broker "$PACT_BROKER_URL" --token "$PACT_BROKER_TOKEN"
```

Constraints:

- Publish from the **consumer's own repo**, immediately after the consumer tests
  pass. Publish before/at the same step as the image push.
- Always send the git SHA and the branch. Feature-branch pacts may be published
  for preview, but they must sit on their own branch so `latest`/`main`
  selectors used by the provider never pick them up.
- The committed pact files (`frontend/pacts/*.json`) stay in git only as the
  local stub-server/demo fixture. Once a broker exists, the broker — not the
  file — is the source of truth for the provider.

## 2. Provider: when to verify, and against whom

Applies to providers (`auth` today). Three triggers; today only the first one
exists.

| # | Trigger | What it proves | Status today |
|---|---------|----------------|--------------|
| 1 | push / PR on the provider repo | provider still satisfies everyone's current contracts | ✅ `auth-ci.yml` `pact-verify` job |
| 2 | PactFlow webhook → `repository_dispatch` on the provider repo, fired whenever **any consumer publishes** | a consumer tightened a contract while the provider did not change | ❌ missing — nothing replaces it after the split |
| 3 | nightly `schedule` (optional) | resends the matrix if a webhook was lost; keeps `can-i-deploy` reports trustworthy | ❌ missing |

Trigger 2 is the important one: push-triggered CI is blind to consumer-driven
breakage, and once the folders become separate repos the provider cannot even
read the consumer's pact files as a fallback.

### "All consumers" comes from the broker, not from a list

Never hardcode consumer names in the provider workflow:

```bash
pact-verifier \
  --provider=auth --provider-app-version "$GIT_SHA" \
  --provider-base-url http://localhost:8080 \
  --pact-broker-url "$PACT_BROKER_URL" --pact-broker-token "$PACT_BROKER_TOKEN" \
  --consumer-version-selectors '{"main": true}' \
  --consumer-version-selectors '{"latest": true}' \
  --consumer-version-selectors '{"deployed": true}' \
  --publish-verification-results
```

- `main` → the contracts consumers actually ship. **Must pass**; this is the gate.
- `latest` → contracts heading our way. Warn / allow-fail; it is the early
  "breaking change incoming" signal.
- `deployed` → pacts from versions currently running somewhere.

The result is a verification matrix with one row per consumer version, so a new
consumer needs no change in the provider repo — it appears in the matrix the
first time it publishes.

## 3. What the submodule split breaks (must fix while splitting)

| Current code | Problem after the split | Fix |
|--------------|-------------------------|-----|
| `.github/workflows/auth-ci.yml` verifies `../frontend/pacts/*.json` when no broker is configured | a standalone `auth` repo has no sibling `frontend` checkout | delete the fallback; broker is the only source |
| `auth-ci.yml` runs `bash contracts/install-pact-ffi.sh` from the umbrella root; `contracts/fixtures/*.json` are shared by both sides | that path no longer exists for either repo | move the script + fixtures into the repo that needs them, or publish one shared package (npm / go module / tiny repo) |
| `paths: ['auth/**', 'contracts/**']` filters in both workflows | repo root == service root, so the filter never filters | delete `paths:` |
| `cache-dependency-path: frontend/pnpm-lock.yaml` style paths | prefixed for a monorepo layout | drop the folder prefix |

Umbrella repo (this one): **no publish, no verify.** Its only optional pact job
is read-only — run `can-i-deploy` for every pinned gitlink pair to answer "is
*this exact set of SHAs* mutually compatible?" without executing tests.

## 4. Deploy ordering

Submodules remove the atomic cross-repo commit, so ordering becomes a rule:
**provider-compatible-first.**

```
consumer publishes new pact
        └─ webhook → provider re-verifies matrix → results published
                └─ can-i-deploy (private deploy pipeline) can go green
                        └─ if the pact needs new provider behaviour: deploy + tag `prod`
                           for the provider BEFORE the consumer may deploy
```

The hard gate stays `can-i-deploy` in the private deploy pipeline
(`docs/microservices-deployment-plan.md`), not the consumer tests.
