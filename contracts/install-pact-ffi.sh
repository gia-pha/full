#!/usr/bin/env bash
# Installs the Pact FFI library (libpact_ffi) required to build and run the
# Go provider verification tests (auth/contracts).
#
# pact-go links against libpact_ffi found in /tmp, /opt/pact/lib or
# /usr/local/lib (see pact-go internal/native LDFLAGS). This script installs
# it into /opt/pact/lib when writable, otherwise into /tmp.
set -euo pipefail

VERSION="${PACT_FFI_VERSION:-0.5.8}"

case "$(uname -s)" in
  Linux)  OS=linux; EXT=so ;;
  Darwin) OS=macos; EXT=dylib ;;
  *) echo "unsupported OS: $(uname -s)" >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) ARCH=x86_64 ;;
  aarch64|arm64) ARCH=aarch64 ;;
  *) echo "unsupported arch: $(uname -m)" >&2; exit 1 ;;
esac

LIBNAME="libpact_ffi"
if [ "$OS" = "linux" ]; then LIBNAME="libpact_ffi"; fi

if mkdir -p /opt/pact/lib 2>/dev/null; then
  DIR=/opt/pact/lib
else
  DIR=/tmp
fi

TARGET="$DIR/$LIBNAME.$EXT"
if [ -f "$TARGET" ] && [ "$(wc -c < "$TARGET")" -gt 1000000 ]; then
  echo "already installed: $TARGET"
  exit 0
fi

URL="https://github.com/pact-foundation/pact-reference/releases/download/${LIBNAME}-v${VERSION}/${LIBNAME}-${OS}-${ARCH}.${EXT}.gz"
echo "downloading $URL"
curl -fsSL "$URL" | gunzip > "$TARGET"
chmod 644 "$TARGET"
echo "installed ${LIBNAME} v${VERSION} -> $TARGET"
