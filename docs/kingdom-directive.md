# Kingdom Directive — Framework Specification

**Version:** 1.0.0  
**Status:** Active  

---

## Overview

The Kingdom Directive is a perpetual operational framework for the MailchimpLegacyProtocol repository. It defines the architecture, principles, and evolution strategy for all Mailchimp workflow integrations and marketing automation tooling maintained in this repository.

The framework is designed to be:

- **Perpetual** – It does not expire or become obsolete; it evolves.
- **Modular** – Components can be adopted, extended, or replaced independently.
- **Transparent** – All directives are documented and open to review.
- **Automation-friendly** – Scripted hooks and workflow templates make it usable by both humans and AI agents.

---

## Framework Components

### 1. Core Knowledge Base

The knowledge base is distributed across several key files:

| File | Role |
|---|---|
| `README.md` | Top-level orientation and quick-start guide |
| `AGENTS.md` | Operational directives for all contributors and AI agents |
| `docs/kingdom-directive.md` | This file — the authoritative framework specification |
| `docs/api-hooks.md` | API hook interface reference |

### 2. Workflows

Workflows are declarative YAML files in `workflows/` that describe the sequence of operations for common Mailchimp integration tasks.

| Workflow | Purpose |
|---|---|
| `campaign-automation.yml` | Schedule, configure, and dispatch email campaigns |
| `subscriber-sync.yml` | Synchronize subscriber data between Mailchimp and external sources |

### 3. Templates

Templates in `templates/` provide validated, reusable JSON structures for Mailchimp entities. Using templates as a starting point reduces errors and ensures consistency across integrations.

| Template | Purpose |
|---|---|
| `email-campaign.json` | Email campaign configuration |
| `audience-segment.json` | Audience segmentation rules |

### 4. Scripts

Scripts in `scripts/` provide programmatic entry points for automation and knowledge-base management.

| Script | Purpose |
|---|---|
| `api-hook.js` | Receives and dispatches API hook events |
| `sync-knowledge-base.js` | Synchronizes the local knowledge base with upstream sources |

---

## Operational Mandates

The following mandates govern all work within this framework:

1. **Mandate 1 – Documentation Currency**: Documentation must be updated in the same pull request as any code or workflow change it describes.

2. **Mandate 2 – Template Integrity**: Required fields in templates must never be removed without a migration plan and a major version bump.

3. **Mandate 3 – Secure Credentials**: No credentials, tokens, or secrets may appear in any file tracked by version control. Use environment variables exclusively.

4. **Mandate 4 – Backward Compatibility**: Changes to API hook interfaces or workflow schemas must be backward-compatible within the same major version.

5. **Mandate 5 – Continuous Alignment**: All contributors must review the latest version of this document before beginning significant work on the repository.

---

## Evolution Strategy

The Kingdom Directive evolves through a structured versioning process:

- **Patch (x.x.N)** – Typo fixes, clarifications, non-breaking additions to documentation.
- **Minor (x.N.0)** – New components, new templates, new workflow steps, or new operational mandates that do not break existing behavior.
- **Major (N.0.0)** – Breaking changes to templates, workflow schemas, or API hook interfaces.

### Changelog

| Version | Date | Summary |
|---|---|---|
| 1.0.0 | 2026-03-06 | Initial Kingdom Directive framework established |

---

## Continuous Evolution via Automation

The `scripts/sync-knowledge-base.js` script implements a lightweight perpetual learning loop:

1. It reads the current state of all knowledge base files.
2. It fetches any available upstream updates (configurable via environment variable `KB_UPSTREAM_URL`).
3. It merges changes and writes a summary to stdout.

This script can be scheduled (e.g., via a cron job or CI pipeline) to keep the local knowledge base current without manual intervention.

---

## Integration with Mailchimp Workflows

The Kingdom Directive framework integrates with Mailchimp's API through the following pattern:

```
External Trigger → api-hook.js → Workflow YAML → Mailchimp API
```

1. An external system (e.g., a CRM, a webhook, or a scheduled job) fires a trigger.
2. `scripts/api-hook.js` receives the trigger, validates input, and maps it to a workflow.
3. The appropriate workflow YAML defines the sequence of Mailchimp API calls.
4. Results are logged and, optionally, reported back to the triggering system.

See `docs/api-hooks.md` for the full API hook interface reference.

---

_This specification is maintained by all contributors to the MailchimpLegacyProtocol repository. Propose changes via pull request._
