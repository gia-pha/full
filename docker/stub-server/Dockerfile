# Local contract-testing stub: the official pact stub server plus a CORS proxy
# in front of it, as a single image (published on :8090 by docker-compose.yml).
#
# Why a proxy at all: pact-stub-server always answers with
# Access-Control-Allow-Origin: *, never sends Access-Control-Allow-Credentials
# and does not implement OPTIONS, so the browser refuses to read the responses
# of the credentialed login/register calls (credentials:'include' for the sid
# cookie). The binary cannot be configured around that, so it is wrapped.
#
# COPY --from works because the official binary is statically linked.
# Nothing here downloads anything, so the build needs no network.

FROM nginx:1.28-alpine

COPY --from=pactfoundation/pact-stub-server:latest /app/pact-stub-server /usr/local/bin/pact-stub-server

# nginx (port 8090) terminates the CORS handshake and proxies to the stub
# server (port 8091, container-internal only).
COPY cors-proxy.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# pact files stay a runtime mount, so regenerating a pact needs no rebuild
EXPOSE 8090
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
