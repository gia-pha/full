#!/bin/sh
# One container, two processes: the pact stub server on the container-internal
# PACT_STUB_PORT, and nginx on 8090 doing the CORS handshake (cors-proxy.conf).
set -eu

PACT_DIR=${PACT_DIR:-/pacts}
PACT_STUB_PORT=${PACT_STUB_PORT:-8091}
# warn keeps the useful lines (a request that matched no interaction) and drops
# the per-request chatter. Set PACT_STUB_LOG_LEVEL=info to trace every call.
PACT_STUB_LOG_LEVEL=${PACT_STUB_LOG_LEVEL:-warn}

set -- -p "$PACT_STUB_PORT" -d "$PACT_DIR" -l "$PACT_STUB_LOG_LEVEL"

# -w is off by default: its watcher polls every second and reports a phantom
# "File change detected in watched directory" / "Reloaded ..." pair each tick
# when the pact dir is a bind mount, i.e. thousands of log lines a day. Restart
# the service instead after regenerating a pact: docker compose restart stub-server
if [ -n "${PACT_STUB_WATCH:-}" ]; then
    set -- "$@" -w
fi

pact-stub-server "$@" &
stub=$!

# A bad pact file makes the stub server exit straight away; fail the container
# instead of leaving nginx behind to answer 502.
sleep 2
if ! kill -0 "$stub" 2>/dev/null; then
    echo "pact-stub-server exited: check the pact files under $PACT_DIR" >&2
    wait "$stub"
fi

exec nginx -g 'daemon off;'
