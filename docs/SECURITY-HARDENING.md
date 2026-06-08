# Security Hardening

Recommended GitHub settings after bootstrap:

1. Protect `main` with a ruleset or branch protection rule.
2. Require pull requests before merge.
3. Require CI to pass.
4. Block force pushes and branch deletion.
5. Enable Dependabot alerts and security updates.
6. Enable CodeQL.
7. Enable secret scanning and push protection where available.
8. Keep cloud console access separate from GitHub access.
9. Require 2FA for maintainers.
10. Use forks and pull requests for outside contributors.
