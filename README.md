# hello-world

A public test fixture for a reusable security pipeline
([secure-cicd-kit-public](https://github.com/deedeerich/secure-cicd-kit-public)), pinned by full
commit SHA.

- **`.github/workflows/security.yml`** calls the kit's security reusable against this repository
  and proves each scanner *detects* what it is responsible for, not just that it ran. CodeQL taint
  tracking can be proven here because the repository is public. The gate runs advisory on purpose.
- **`.github/workflows/attestation-proof.yml`** builds two images to GHCR, signs one with build
  provenance and leaves the other unsigned, then runs the kit's attestation verification on both.
  It passes only when the signed image reads `ATTESTATION_VERIFIED` and the unsigned one is refused
  as `ATTESTATION_ABSENT`.

The findings in this repository are planted on purpose. See below.

---

# ⚠ SCANNER TEST FIXTURE — NOTHING HERE IS REAL

This repository is a deliberately vulnerable corpus used to prove a security pipeline actually
detects what it claims to detect. **Every defect in it is planted on purpose**, every
credential-shaped string is a published vendor documentation example that authenticates nothing,
and nothing here is deployed or reachable.

**A clean scan of this repository means the pipeline is broken.** That is the test.

- `FIXTURE.md` — what this is and why
- `EXPECTED_FINDINGS.md` — the acceptance criteria: every planted defect and which capability
  should catch it, including the ones **no scanner exists for**, which are listed as exactly that
  rather than allowed to look clean

Do not copy any pattern in this repository into real code.
