# What a working pipeline must report

This is the acceptance test. A scan that misses a row below is a scanner that is configured but
not effective, and the row says which.

| # | file | defect | expected to be caught by |
|---|---|---|---|
| 1 | `app/config.py` | AWS example key + hardcoded password | gitleaks · detect-secrets · bandit B105 |
| 2 | `app/config.py` | `subprocess(..., shell=True)` on user input | bandit B602 · semgrep · CodeQL taint |
| 3 | `web/SearchResults.jsx` | `dangerouslySetInnerHTML` from untrusted input | semgrep `p/xss` · CodeQL `js/xss` |
| 4 | `web/SearchResults.jsx` | `href` taking a user-supplied URL (`javascript:`) | CodeQL `js/unsafe-external-link` family |
| 5 | `web/SearchResults.jsx` | `ref.innerHTML = untrusted` | **CodeQL taint tracking only** — grep misses it |
| 6 | `infra/main.tf` | SSH `0.0.0.0/0` | checkov · trivy config |
| 7 | `infra/main.tf` | public storage, TLS 1.0, HTTP allowed | checkov · trivy config |
| 8 | `Dockerfile` | `FROM python:latest` | checkov · trivy config |
| 9 | `Dockerfile` | runs as root | checkov · trivy config |
| 10 | `scripts/deploy.sh` | unquoted expansion | **NO SCANNER EXISTS** — expect `UNSUPPORTED_PRESENT: sh` |
| 11 | `scripts/deploy.sh` | no `set -euo pipefail` | **NO SCANNER EXISTS** — expect `UNSUPPORTED_PRESENT: sh` |
| 12 | `app/requirements.txt` | `requests==2.19.1`, `PyYAML==5.1` | dependency scan · SBOM |
| 13 | `web/package.json` | `lodash@4.17.11`, `minimist@1.2.0` | dependency scan · SBOM |

**Rows 10 and 11 are a deliberate control.** The kit has no shell scanner, and `.sh` is on
discovery's unsupported list — so the correct result is discovery announcing `UNSUPPORTED_PRESENT:
sh`, not a finding. An earlier draft of this file listed "shell scanning" as the expected catcher,
which would have made a real coverage hole look like a scanner that simply found nothing.

**NO SCANNER EXISTS is a third answer, not a flavour of clean.** Three states a reader must never
see collapsed:

```
NOT_APPLICABLE        the language is not here          nothing to find
CLEAN                 a scanner ran and found nothing   evidence of absence
UNSUPPORTED_PRESENT   the code is here, nothing scans it   ABSENCE OF EVIDENCE
```

**Row 5 is the one that matters most.** Source and sink are in different statements, so it is the
row that distinguishes taint tracking from pattern matching. If rows 3 and 4 appear and row 5 does
not, dataflow is not actually running, whatever the job summary says.

**Two things this fixture CANNOT prove**, and they are stated here so nobody reads a green run as
covering them:

- **Team-pattern enforcement.** This is a solo repository. Required reviewers, CODEOWNERS routing
  and approval separation stay `UNVALIDATED HUMAN-WORKFLOW PATHS` — not failures, and not passing.
- **The blocking gate.** This caller runs advisory. That the gate *blocks* is proven by the
  separate negative-path test, not here.
