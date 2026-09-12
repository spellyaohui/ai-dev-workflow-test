# ai-dev-workflow-test

## Purpose

This repository validates an AI-assisted software development workflow with explicit specification approval, isolated implementation, independent verification, machine-enforced GitHub gates, and separate human merge authorization.

## Development Workflow

```text
Spec
→ Approved GitHub Issue
→ PR Producer / Cursor
→ Pull Request
→ Verifier
→ Publisher
→ GitHub Gates
→ explicit merge authorization
```

The approved GitHub Spec Issue is the authoritative implementation contract. Pull requests must reference the exact approved Spec issue and version so automated gates and independent verification can evaluate the same contract.

## Safety Guarantees

- An unapproved Spec must not be implemented.
- A Verifier `PASS` is bound to the pull request's current head SHA.
- Any new commit changes the head SHA and invalidates the previous `PASS`.
- `PASS` is verification evidence; it is not merge authorization.
- Merge requires separate, explicit human authorization after the current checks and evidence have been inspected.
