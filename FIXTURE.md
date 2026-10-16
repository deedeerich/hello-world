# THIS REPOSITORY IS A SCANNER TEST FIXTURE

Every defect in this repository is **planted on purpose** so that a security pipeline can be
proven to find it. Nothing here is deployed, nothing here is real, and every credential-shaped
string is a documented non-secret from a vendor's own example documentation.

**Do not copy any pattern in this repository into real code.** Each file states, in a comment
above the defect, what is wrong with it and which scanner is expected to report it.

If a scan of this repository comes back CLEAN, the pipeline is broken. That is the point.
