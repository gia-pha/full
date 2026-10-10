#!/usr/bin/env node
// Publishes the generated pact files (frontend/pacts/*.json) to the Pact
// Broker via its REST API.
//
// Environment:
//   PACT_BROKER_URL       required, e.g. http://localhost:9292
//   PACT_BROKER_TOKEN     optional bearer token (PactFlow / token auth)
//   PACT_BROKER_USERNAME  optional basic auth user (OSS broker)
//   PACT_BROKER_PASSWORD  optional basic auth password (OSS broker)
//   PACT_CONSUMER_VERSION optional version (default: current git commit sha)
//   PACT_CONSUMER_TAG     optional tag to apply, e.g. the branch name
//
// Usage: node contracts/publish.mjs [path-to-pacts-dir]

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pactsDir = resolve(
  process.argv[2] || join(repoRoot, 'frontend', 'pacts'),
);

const broker = process.env.PACT_BROKER_URL;
if (!broker) {
  console.error('PACT_BROKER_URL is required (e.g. http://localhost:9292)');
  process.exit(1);
}

const version =
  process.env.PACT_CONSUMER_VERSION ||
  execSync('git rev-parse --short HEAD', { cwd: repoRoot })
    .toString()
    .trim();

const headers = { 'Content-Type': 'application/json' };
if (process.env.PACT_BROKER_TOKEN) {
  headers.Authorization = `Bearer ${process.env.PACT_BROKER_TOKEN}`;
} else if (process.env.PACT_BROKER_USERNAME) {
  headers.Authorization =
    `Basic ${Buffer.from(`${process.env.PACT_BROKER_USERNAME}:${process.env.PACT_BROKER_PASSWORD ?? ''}`).toString('base64')}`;
}

const files = readdirSync(pactsDir).filter((f) => f.endsWith('.json'));
if (files.length === 0) {
  console.error(`no pact files found in ${pactsDir} (run pnpm test:contracts first)`);
  process.exit(1);
}

const base = broker.replace(/\/$/, '');

for (const file of files) {
  const pact = JSON.parse(readFileSync(join(pactsDir, file), 'utf8'));
  const { name: consumer } = pact.consumer;
  const { name: provider } = pact.provider;

  const url = `${base}/pacts/provider/${provider}/consumer/${consumer}/version/${version}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(pact),
  });
  if (!res.ok) {
    console.error(`FAILED ${res.status} ${res.statusText}: PUT ${url}`);
    console.error(await res.text());
    process.exit(1);
  }
  console.log(`published ${consumer}/${provider} version ${version}`);

  const tag = process.env.PACT_CONSUMER_TAG;
  if (tag) {
    const tagUrl = `${base}/pacticipants/${consumer}/versions/${version}/tags/${tag}`;
    const tagRes = await fetch(tagUrl, {
      method: 'PUT',
      headers,
      body: '{}',
    });
    if (!tagRes.ok && tagRes.status !== 201 && tagRes.status !== 200) {
      console.error(`FAILED to tag ${tag}: ${tagRes.status}`);
      console.error(await tagRes.text());
      process.exit(1);
    }
    console.log(`tagged ${consumer} version ${version} with "${tag}"`);
  }
}
