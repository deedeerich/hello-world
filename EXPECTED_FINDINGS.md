# What a working pipeline must report

This is the acceptance test. A scan that misses a row below is a scanner that is configured but
not effective, and the row says which.

| # | file | defect | expected to be caught by |
|---|---|---|---|
| 1 | `app/config.py` | synthetic AWS key pair + hardcoded password | gitleaks · detect-secrets · bandit B105 |
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


---

## Recorded from the first live run, 2026-09-15

| capability | state reached | note |
|---|---|---|
| Semgrep | **DETECTION_PROVEN** | 6 results, including the XSS sinks |
| Bandit | **DETECTION_PROVEN** | 5 results |
| Trivy (fs) | **DETECTION_PROVEN** | 8 results |
| osv-scanner | **DETECTION_PROVEN** | 48 results |
| CodeQL | **EXECUTED** | ran both language packs, uploaded, **0 results** — detection NOT proven |
| gitleaks | **EXECUTED** | 0 results over a fixture built from an allowlisted example key — **the fixture was wrong**, now repaired |
| Checkov / Trivy config | **not executed** | applicability was gated by the language selector — a kit defect, now fixed |

**EXECUTED is not DETECTION_PROVEN.** Every one of those jobs was green. Collapsing them into a
single post-run "effective" state would have recorded two controls as working on the strength of
them having run — and a green job is the most persuasive possible evidence for a control that did
nothing.

## Query-matched rows added after the first run returned CodeQL = 0

A sink with no source is not a dataflow test. The original JSX defects took `query` as a React
prop, which no taint engine treats as attacker-controlled, so CodeQL had nothing to track and
reported zero **correctly**. Semgrep flagged them on pattern alone, which is why the two disagreed.

| # | file | source → sink | query documented to catch it |
|---|---|---|---|
| 14 | `web/SearchResults.jsx` | `window.location.search` → `innerHTML` | `js/xss` |
| 15 | `web/SearchResults.jsx` | `document.location.hash` → `window.location` | `js/client-side-unvalidated-url-redirection` |
| 16 | `web/SearchResults.jsx` | `location.search` → `dangerouslySetInnerHTML` | `js/xss` |

**If CodeQL still returns zero on rows 14–16, the finding is about CodeQL or its configuration.**
Until then it was about the fixture, and recording it as a scanner failure would have been wrong.
