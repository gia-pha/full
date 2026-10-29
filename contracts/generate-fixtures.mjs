#!/usr/bin/env node
// Generates deterministic, cryptographically valid WebAuthn fixtures used by:
//   - frontend consumer contract tests (as the mocked browser WebAuthn output)
//   - auth provider pact verification (provider states seed the matching
//     session/challenge and credential public key)
//
// The fixtures are self-consistent: a fresh EC P-256 key pair is created on
// every run, the assertion signature is produced with it, and only the COSE
// public key is exported (the private key is never written to disk).
//
// Usage: node contracts/generate-fixtures.mjs

import { createHash, generateKeyPairSync, sign as cryptoSign } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'fixtures');

const RP_ID = 'localhost';
const ORIGIN = 'http://localhost:8083';

const CHALLENGE_BYTES = Buffer.from(
  '0123456789abcdef0123456789abcdef',
  'hex',
);
const USER_ID = Buffer.from('pactuser00000001');
const CREDENTIAL_ID = Buffer.from('pactcred00000001');
const AAGUID = Buffer.alloc(16);

const b64url = (buf) =>
  Buffer.from(buf).toString('base64url');

// ---------------------------------------------------------------- CBOR ----
// Minimal deterministic CBOR encoder (definite lengths, minimal heads).
function head(major, len) {
  if (len < 24) return Buffer.from([(major << 5) | len]);
  if (len < 0x100) return Buffer.from([(major << 5) | 24, len]);
  if (len < 0x10000)
    return Buffer.from([(major << 5) | 25, len >> 8, len & 0xff]);
  const b = Buffer.alloc(5);
  b[0] = (major << 5) | 26;
  b.writeUInt32BE(len, 1);
  return b;
}
const cborBytes = (b) => Buffer.concat([head(2, b.length), b]);
const cborText = (s) => {
  const t = Buffer.from(s, 'utf8');
  return Buffer.concat([head(3, t.length), t]);
};
const cborInt = (n) =>
  n >= 0 ? head(0, n) : head(1, -1 - n);
function cborMap(entries) {
  const parts = [head(5, entries.length)];
  for (const [k, v] of entries) parts.push(k, v);
  return Buffer.concat(parts);
}

// ------------------------------------------------------------ key pair ----
const { privateKey, publicKey } = generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
});
const jwk = publicKey.export({ format: 'jwk' });
const x = Buffer.from(jwk.x, 'base64url');
const y = Buffer.from(jwk.y, 'base64url');

const coseKey = cborMap([
  [cborInt(1), cborInt(2)], // kty: EC2
  [cborInt(3), cborInt(-7)], // alg: ES256
  [cborInt(-1), cborInt(2)], // crv: P-256
  [cborInt(-2), cborBytes(x)],
  [cborInt(-3), cborBytes(y)],
]);

const rpIdHash = createHash('sha256').update(RP_ID).digest();

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

// ------------------------------------------------- registration fixture ----
const challenge = b64url(CHALLENGE_BYTES);

const regClientData = Buffer.from(
  JSON.stringify({
    type: 'webauthn.create',
    challenge,
    origin: ORIGIN,
    crossOrigin: false,
  }),
);

// flags: UP(0x01) | UV(0x04) | AT(0x40)
const regAuthData = Buffer.concat([
  rpIdHash,
  Buffer.from([0x45]),
  u32(0),
  AAGUID,
  Buffer.from([CREDENTIAL_ID.length >> 8, CREDENTIAL_ID.length & 0xff]),
  CREDENTIAL_ID,
  coseKey,
]);

const attestationObject = cborMap([
  [cborText('fmt'), cborText('none')],
  [cborText('attStmt'), cborMap([])],
  [cborText('authData'), cborBytes(regAuthData)],
]);

const attestation = {
  id: b64url(CREDENTIAL_ID),
  rawId: b64url(CREDENTIAL_ID),
  type: 'public-key',
  response: {
    clientDataJSON: b64url(regClientData),
    attestationObject: b64url(attestationObject),
  },
  clientExtensionResults: {},
};

// ------------------------------------------------------- assertion fixture ----
const assertClientData = Buffer.from(
  JSON.stringify({
    type: 'webauthn.get',
    challenge,
    origin: ORIGIN,
    crossOrigin: false,
  }),
);

// flags: UP(0x01) | UV(0x04)
const assertAuthData = Buffer.concat([
  rpIdHash,
  Buffer.from([0x05]),
  u32(1),
]);

const sigData = Buffer.concat([
  assertAuthData,
  createHash('sha256').update(assertClientData).digest(),
]);
// go-webauthn v0.16 expects an ASN.1 DER encoded ECDSA signature.
const signature = cryptoSign('sha256', sigData, {
  key: privateKey,
  dsaEncoding: 'der',
});

const assertion = {
  id: b64url(CREDENTIAL_ID),
  rawId: b64url(CREDENTIAL_ID),
  type: 'public-key',
  response: {
    clientDataJSON: b64url(assertClientData),
    authenticatorData: b64url(assertAuthData),
    signature: b64url(signature),
    userHandle: b64url(USER_ID),
  },
  clientExtensionResults: {},
};

// ---------------------------------------------------------------- output ----
const params = {
  rpId: RP_ID,
  origin: ORIGIN,
  challenge,
  userId: b64url(USER_ID),
  credentialId: b64url(CREDENTIAL_ID),
  cosePublicKey: b64url(coseKey),
  generatedAt: new Date().toISOString(),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'params.json'), `${JSON.stringify(params, null, 2)}\n`);
writeFileSync(
  join(outDir, 'attestation.json'),
  `${JSON.stringify(attestation, null, 2)}\n`,
);
writeFileSync(
  join(outDir, 'assertion.json'),
  `${JSON.stringify(assertion, null, 2)}\n`,
);

console.log(`fixtures written to ${outDir}`);
console.log(`  challenge: ${params.challenge}`);
