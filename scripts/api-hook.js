/**
 * api-hook.js
 *
 * API Hook entry point for the Kingdom Directive framework.
 *
 * Usage (programmatic):
 *   const { dispatch } = require('./api-hook');
 *   const result = await dispatch({ event: 'campaign.send', payload: { ... } });
 *
 * Usage (HTTP server):
 *   API_HOOK_PORT=3000 node scripts/api-hook.js --serve
 *
 * Environment variables:
 *   MAILCHIMP_API_KEY       — Mailchimp API key (required for Mailchimp actions)
 *   MAILCHIMP_SERVER_PREFIX — Mailchimp data center prefix, e.g. "us1" (default: "us1")
 *   API_HOOK_PORT           — Port for the HTTP server (default: 3000)
 *   LOG_LEVEL               — Logging verbosity: debug|info|warn|error (default: "info")
 *
 * See docs/api-hooks.md for the full event reference.
 */

'use strict';

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function log(level, message) {
  if ((LOG_LEVELS[level] ?? 0) >= LOG_LEVEL) {
    const ts = new Date().toISOString();
    process.stdout.write(`[${ts}] [${level.toUpperCase()}] ${message}\n`);
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

const handlers = {
  'campaign.send': async (payload) => {
    assertFields(payload, ['campaignId', 'listId']);
    log('info', `Dispatching campaign.send for campaignId=${payload.campaignId}`);
    return { workflowId: 'campaign-automation', action: 'send', campaignId: payload.campaignId };
  },

  'campaign.create': async (payload) => {
    assertFields(payload, ['templateName', 'subject', 'listId']);
    log('info', `Dispatching campaign.create: template=${payload.templateName}`);
    return { workflowId: 'campaign-automation', action: 'create', templateName: payload.templateName };
  },

  'subscriber.sync': async (payload) => {
    assertFields(payload, ['source', 'listId']);
    log('info', `Dispatching subscriber.sync for listId=${payload.listId}`);
    return { workflowId: 'subscriber-sync', source: payload.source, listId: payload.listId };
  },

  'subscriber.add': async (payload) => {
    assertFields(payload, ['email', 'listId']);
    log('info', `Dispatching subscriber.add: email=${payload.email}`);
    return { workflowId: 'subscriber-sync', action: 'add', email: payload.email };
  },

  'subscriber.remove': async (payload) => {
    assertFields(payload, ['email', 'listId']);
    log('info', `Dispatching subscriber.remove: email=${payload.email}`);
    return { workflowId: 'subscriber-sync', action: 'remove', email: payload.email };
  },

  'knowledge.sync': async (_payload) => {
    log('info', 'Dispatching knowledge.sync');
    const { sync } = require('./sync-knowledge-base');
    const summary = await sync();
    return { workflowId: 'knowledge-sync', summary };
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertFields(payload, fields) {
  const missing = fields.filter((f) => payload[f] === undefined || payload[f] === null);
  if (missing.length > 0) {
    throw new Error(`Missing required payload fields: ${missing.join(', ')}`);
  }
}

// ---------------------------------------------------------------------------
// Core dispatch function
// ---------------------------------------------------------------------------

/**
 * Dispatch an API hook event.
 *
 * @param {object} request
 * @param {string} request.event    - Event name (see docs/api-hooks.md).
 * @param {object} request.payload  - Event-specific payload.
 * @param {object} [request.meta]   - Optional metadata ({ requestId, timestamp }).
 * @returns {Promise<object>}       - Structured response object.
 */
async function dispatch(request) {
  const { event, payload = {}, meta = {} } = request;
  const requestId = meta.requestId || null;
  const processedAt = new Date().toISOString();

  if (!event) {
    return { status: 'error', error: 'Missing required field: event', meta: { requestId, processedAt } };
  }

  const handler = handlers[event];
  if (!handler) {
    return {
      status: 'error',
      error: `Unknown event: "${event}". See docs/api-hooks.md for supported events.`,
      meta: { requestId, processedAt },
    };
  }

  try {
    const result = await handler(payload);
    return { status: 'ok', workflowId: result.workflowId, result, meta: { requestId, processedAt } };
  } catch (err) {
    log('error', `Hook error [event=${event}] [requestId=${requestId}]: ${err.message}`);
    return { status: 'error', error: err.message, meta: { requestId, processedAt } };
  }
}

// ---------------------------------------------------------------------------
// Optional HTTP server mode
// ---------------------------------------------------------------------------

function startServer(port) {
  const http = require('http');

  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/hook') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', error: 'Not found. POST to /hook.' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: 'Invalid JSON body.' }));
        return;
      }

      const response = await dispatch(parsed);
      const statusCode = response.status === 'ok' ? 200 : 400;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    });
  });

  server.listen(port, () => {
    log('info', `API hook server listening on port ${port}`);
  });

  return server;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--serve')) {
    const port = parseInt(process.env.API_HOOK_PORT || '3000', 10);
    startServer(port);
  } else {
    process.stderr.write('Usage: node scripts/api-hook.js --serve\n');
    process.exit(1);
  }
}

module.exports = { dispatch };
