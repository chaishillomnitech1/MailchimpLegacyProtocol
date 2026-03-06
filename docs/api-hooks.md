# API Hooks — Reference and Usage Guide

This document describes the API hook interface provided by `scripts/api-hook.js`. API hooks allow external systems to trigger Mailchimp workflow operations programmatically.

---

## Overview

API hooks act as the integration boundary between external triggers (webhooks, scheduled jobs, CI pipelines) and the workflow engine. Every hook:

- Accepts a structured JSON payload.
- Validates the payload against a defined schema.
- Dispatches execution to the appropriate workflow.
- Returns a structured JSON response.

---

## Invoking a Hook

### Direct invocation (Node.js)

```js
const { dispatch } = require('./scripts/api-hook');

const response = await dispatch({
  event: 'campaign.send',
  payload: {
    campaignId: 'abc123',
    listId:     'def456'
  }
});

console.log(response);
// { status: 'ok', workflowId: 'campaign-automation', result: { ... } }
```

### HTTP invocation

When the hook server is running (`node scripts/api-hook.js --serve`), it listens on the port defined by the `API_HOOK_PORT` environment variable (default: `3000`).

```bash
curl -X POST http://localhost:3000/hook \
  -H "Content-Type: application/json" \
  -d '{"event":"campaign.send","payload":{"campaignId":"abc123","listId":"def456"}}'
```

---

## Supported Events

| Event | Description | Required Payload Fields |
|---|---|---|
| `campaign.send` | Schedule and dispatch a campaign | `campaignId`, `listId` |
| `campaign.create` | Create a new campaign from a template | `templateName`, `subject`, `listId` |
| `subscriber.sync` | Synchronize subscriber data | `source`, `listId` |
| `subscriber.add` | Add a single subscriber | `email`, `listId` |
| `subscriber.remove` | Remove a subscriber | `email`, `listId` |
| `knowledge.sync` | Trigger a knowledge-base synchronization | _(none required)_ |

---

## Request Schema

```json
{
  "event": "<event-name>",
  "payload": {
    "<field>": "<value>"
  },
  "meta": {
    "requestId": "<optional-uuid>",
    "timestamp":  "<optional-ISO-8601>"
  }
}
```

- `event` _(required)_ – One of the supported event names above.
- `payload` _(required)_ – Event-specific data. See table above for required fields.
- `meta` _(optional)_ – Metadata for tracing and logging. `requestId` is echoed back in the response.

---

## Response Schema

```json
{
  "status": "ok" | "error",
  "workflowId": "<workflow-that-handled-the-event>",
  "result": { ... },
  "error": "<error message, only present when status is error>",
  "meta": {
    "requestId": "<echoed from request>",
    "processedAt": "<ISO-8601>"
  }
}
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MAILCHIMP_API_KEY` | _(required)_ | Mailchimp API key. Never commit this value. |
| `MAILCHIMP_SERVER_PREFIX` | `us1` | Mailchimp data center prefix (e.g., `us1`, `us6`). |
| `API_HOOK_PORT` | `3000` | Port for the HTTP hook server. |
| `KB_UPSTREAM_URL` | _(optional)_ | URL for upstream knowledge-base synchronization. |
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). |

---

## Error Handling

The hook returns `status: "error"` for:

- Missing required payload fields.
- Unknown event names.
- Mailchimp API errors (the raw Mailchimp error is included in `result`).
- Network or timeout failures.

All errors are logged with the `requestId` for traceability.

---

## Adding a New Event

1. Add the event name and required payload fields to the table in this document.
2. Implement the handler in `scripts/api-hook.js` following the existing handler pattern.
3. Add or update the corresponding workflow YAML in `workflows/` if the event maps to a multi-step workflow.
4. Add tests in `scripts/api-hook.test.js` (if the test file exists) covering the happy path and error cases.
