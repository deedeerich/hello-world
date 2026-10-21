# The SIGNED image: attestation-proof.yml builds it, pushes it to GHCR and signs its digest with
# build provenance. Its digest must verify as ATTESTATION_VERIFIED. busybox, pinned by digest,
# with one static file. Nothing else.
#
# NOT A PLANTED DEFECT. Unlike the root Dockerfile, this one runs as a non-root user and declares
# a health check, so it adds nothing to EXPECTED_FINDINGS.md.
FROM busybox:1.36.1@sha256:73aaf090f3d85aa34ee199857f03fa3a95c8ede2ffd4cc2cdb5b94e566b11662
RUN mkdir -p /www && echo "kit attestation proof: signed" > /www/index.html
USER nobody
HEALTHCHECK CMD ["test", "-s", "/www/index.html"]
CMD ["cat", "/www/index.html"]
