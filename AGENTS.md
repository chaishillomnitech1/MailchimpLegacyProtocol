# AGENTS.md — Operational Directives for AI Agents and Collaborators

This document defines the operational directives, contribution guidelines, and alignment principles for all agents (human and AI) interacting with the MailchimpLegacyProtocol repository and its Kingdom Directive framework.

---

## 1. Purpose

AGENTS.md encodes the knowledge base and behavioral directives that ensure every contributor—automated or human—acts in alignment with the repository's mission and the Kingdom Directive framework.

---

## 2. Guiding Principles

| Principle | Description |
|---|---|
| **Mission Alignment** | All changes must advance the repository's core mission: enhancing Mailchimp workflow integration and marketing automation. |
| **Modularity** | Contributions should be self-contained and reusable wherever possible, using the templates in `templates/` as a starting point. |
| **Documentation First** | Every new feature, script, or workflow must be accompanied by updated documentation in `docs/`. |
| **Non-Breaking Changes** | Modifications to existing workflows or scripts must not break existing integrations without a documented migration path. |
| **Continuous Improvement** | Propose enhancements through pull requests with clear rationale, referencing the Kingdom Directive specification in `docs/kingdom-directive.md`. |

---

## 3. Operational Directives for AI Agents

AI agents operating in this repository must follow these directives:

1. **Read before writing** – Always review relevant existing files (`docs/`, `templates/`, `workflows/`) before proposing or making changes.
2. **Minimal footprint** – Make the smallest possible change that fully addresses the task. Avoid touching unrelated files.
3. **Test alignment** – Validate that changes are consistent with existing workflow patterns described in `workflows/`.
4. **Document changes** – Update `docs/kingdom-directive.md` or other relevant docs when introducing new concepts, directives, or capabilities.
5. **Respect the structure** – Place files in the correct directory as defined in `README.md`. Do not create ad-hoc directories without updating the repository structure documentation.
6. **Surface ambiguity** – If a task or directive is unclear, raise the ambiguity explicitly rather than guessing.

---

## 4. Contribution Workflow

```
1. Fork or branch from main
2. Review AGENTS.md and docs/kingdom-directive.md
3. Make changes following the directives above
4. Update affected documentation
5. Open a pull request with a clear description referencing the relevant directive or issue
6. Address review feedback promptly
```

---

## 5. Template Usage

When creating new campaigns or audience segments, start from the templates in `templates/`:

- `templates/email-campaign.json` — Base template for email campaign configurations.
- `templates/audience-segment.json` — Base template for audience segmentation rules.

Extend templates by adding new fields; do not remove or rename existing required fields without updating all consumers and documentation.

---

## 6. API Hook Guidelines

API hooks (in `scripts/api-hook.js`) must:

- Accept input via a well-defined interface (see `docs/api-hooks.md`).
- Return structured, predictable responses.
- Handle errors gracefully and log descriptive messages.
- Never store or transmit credentials in plaintext; use environment variables.

---

## 7. Knowledge Base Synchronization

The script `scripts/sync-knowledge-base.js` supports real-time updates to the repository's knowledge base. Agents may invoke this script to pull the latest operational context before performing knowledge-intensive tasks.

Usage:
```bash
node scripts/sync-knowledge-base.js
```

---

## 8. Versioning and Evolution

The Kingdom Directive framework is versioned in `docs/kingdom-directive.md`. When introducing breaking changes to directives or templates, increment the major version in that document and add an entry to the changelog section.

---

_This document is a living specification. All contributors are expected to keep it current as the framework evolves._
