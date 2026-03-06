/**
 * sync-knowledge-base.js
 *
 * Knowledge Base Synchronization Script
 *
 * Implements a lightweight perpetual learning loop for the Kingdom Directive
 * framework. It reads the current state of all knowledge-base files and,
 * optionally, fetches upstream updates from a configured URL.
 *
 * Usage:
 *   node scripts/sync-knowledge-base.js
 *
 * Environment variables:
 *   KB_UPSTREAM_URL — URL to fetch upstream knowledge-base updates from (optional).
 *   LOG_LEVEL       — Logging verbosity: debug|info|warn|error (default: "info").
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL  = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function log(level, message) {
  if ((LOG_LEVELS[level] ?? 0) >= LOG_LEVEL) {
    const ts = new Date().toISOString();
    process.stdout.write(`[${ts}] [${level.toUpperCase()}] ${message}\n`);
  }
}

// Knowledge-base files relative to the repository root.
const REPO_ROOT = path.resolve(__dirname, '..');
const KB_FILES = [
  'README.md',
  'AGENTS.md',
  'docs/kingdom-directive.md',
  'docs/api-hooks.md',
];

/**
 * Read the current state of all knowledge-base files.
 * @returns {{ file: string, size: number, lastModified: string }[]}
 */
function readKnowledgeBase() {
  return KB_FILES.map((relPath) => {
    const absPath = path.join(REPO_ROOT, relPath);
    try {
      const stats = fs.statSync(absPath);
      return {
        file: relPath,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        exists: true,
      };
    } catch {
      return { file: relPath, exists: false };
    }
  });
}

/**
 * Fetch content from a URL (http or https).
 * @param {string} url
 * @returns {Promise<string>}
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Run the knowledge-base synchronization.
 * @returns {Promise<object>} Summary of the sync operation.
 */
async function sync() {
  log('info', 'Starting knowledge-base synchronization...');

  const currentState = readKnowledgeBase();
  log('debug', `Read ${currentState.length} knowledge-base files.`);

  const summary = {
    timestamp: new Date().toISOString(),
    files: currentState,
    upstreamFetched: false,
    upstreamError: null,
  };

  const upstreamUrl = process.env.KB_UPSTREAM_URL;
  if (upstreamUrl) {
    log('info', `Fetching upstream updates from ${upstreamUrl}...`);
    try {
      const upstreamData = await fetchUrl(upstreamUrl);
      log('info', `Received ${upstreamData.length} bytes from upstream.`);
      summary.upstreamFetched = true;
      summary.upstreamBytes = upstreamData.length;
    } catch (err) {
      log('warn', `Failed to fetch upstream updates: ${err.message}`);
      summary.upstreamError = err.message;
    }
  } else {
    log('debug', 'KB_UPSTREAM_URL not set; skipping upstream fetch.');
  }

  const presentCount = currentState.filter((f) => f.exists).length;
  log('info', `Knowledge-base sync complete. ${presentCount}/${currentState.length} files present.`);

  return summary;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  sync()
    .then((summary) => {
      process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
      process.exit(0);
    })
    .catch((err) => {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    });
}

module.exports = { sync, readKnowledgeBase };
