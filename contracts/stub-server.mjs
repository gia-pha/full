#!/usr/bin/env node
// Pact stub server: serves the mock APIs described by the generated contract
// files, so the frontend can run in "demo" mode without the auth backend.
//
// Usage: node contracts/stub-server.mjs [--port 8090] [--pacts <dir>]
//
// Defaults: port 8090, pacts dir <repo>/frontend/pacts.

import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const port = Number(arg('port', process.env.STUB_PORT || 8090));
const pactsDir = resolve(arg('pacts', join(repoRoot, 'frontend', 'pacts')));

// ---------------------------------------------------------------- pacts ----
const interactions = [];
for (const file of readdirSync(pactsDir).filter((f) => f.endsWith('.json'))) {
  const pact = JSON.parse(readFileSync(join(pactsDir, file), 'utf8'));
  for (const it of pact.interactions || []) {
    interactions.push({ consumer: pact.consumer.name, ...it });
  }
}
if (interactions.length === 0) {
  console.error(`no interactions found in ${pactsDir}`);
  console.error('run "pnpm test:contracts" in frontend/ first');
  process.exit(1);
}

// Header names that have matching rules are not matched literally.
function literalHeaders(interaction) {
  const rules = interaction.request.matchingRules || {};
  const headerRuleNames = new Set();
  const addRuleKeys = (source, prefix) => {
    for (const path of Object.keys(source || {})) {
      if (path.startsWith(prefix)) {
        headerRuleNames.add(path.slice(prefix.length).toLowerCase());
      }
    }
  };
  addRuleKeys(rules, '$.headers.');
  addRuleKeys(rules.header ?? rules.headers, '$.');
  const out = [];
  for (const [name, value] of Object.entries(interaction.request.headers || {})) {
    if (!headerRuleNames.has(name.toLowerCase())) {
      out.push([name.toLowerCase(), String(value)]);
    }
  }
  return out;
}

function matches(interaction, req) {
  if (interaction.request.method.toUpperCase() !== req.method) return false;
  if (interaction.request.path !== req.url.split('?')[0]) return false;
  for (const [name, value] of literalHeaders(interaction)) {
    if (req.headers[name] !== value) return false;
  }
  return true;
}

// --------------------------------------------------------------- server ----
const server = createServer(async (req, res) => {
  const origin = req.headers.origin;

  // CORS so the frontend dev server (a different origin) can call the stub.
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const bodyChunks = [];
  for await (const chunk of req) bodyChunks.push(chunk);

  const interaction = interactions.find((it) => matches(it, req));
  if (!interaction) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: `no pact interaction matches ${req.method} ${req.url}`,
      }),
    );
    return;
  }

  console.log(
    `${req.method} ${req.url} -> "${interaction.description}" (${interaction.consumer}/${interaction.response.status})`,
  );

  const response = interaction.response;
  const body =
    response.body ?? response.contents?.['application/json'] ?? {};
  const contentType = body.contentType || 'application/json';
  const headers = { 'Content-Type': contentType };
  for (const [name, value] of Object.entries(response.headers || {})) {
    if (name.toLowerCase() === 'content-type') continue;
    const values = Array.isArray(value) ? value : [value];
    res.setHeader(name, values);
  }

  res.writeHead(response.status, headers);

  const content = body.content;
  if (content === undefined || content === null) {
    res.end('');
  } else if (typeof content === 'string') {
    res.end(content);
  } else {
    res.end(JSON.stringify(content));
  }
});

server.listen(port, () => {
  console.log(`pact stub server for "${interactions[0].consumer}" -> auth`);
  console.log(`listening on http://localhost:${port} (pacts: ${pactsDir})`);
  for (const it of interactions) {
    console.log(
      `  ${it.request.method} ${it.request.path} -> ${it.response.status}  (${it.description})`,
    );
  }
});
