# Security Policy

## Supported Versions

Only the `main` branch is currently supported with security fixes.

## Reporting a Vulnerability

Please do not open public issues for security problems.

Report vulnerabilities privately to the maintainer:
- Contact: repository owner on GitHub (`@JanMolcik`)
- Include: impact, reproduction steps, proof of concept, and affected commit hash

Response targets:
- Initial acknowledgement: within 72 hours
- Triage update: within 7 days
- Fix and disclosure timeline: coordinated based on severity

## Security Baseline

This repository uses:
- Automated dependency updates (Dependabot)
- Secret scanning in CI (Gitleaks)
- Static analysis in CI (CodeQL)
- `npm audit` checks in CI
- Security HTTP headers and CSP in runtime proxy
