# The SIGNED image: attestation-proof.yml builds it, pushes it to GHCR and signs its digest with
# build provenance. Its digest must verify as ATTESTATION_VERIFIED. busybox, pinned by digest,
# with one static file. Nothing else.
FROM busybox:1.36.1@sha256:73aaf090f3d85aa34ee199857f03fa3a95c8ede2ffd4cc2cdb5b94e566b11662
RUN mkdir -p /www && echo "kit attestation proof: signed" > /www/index.html
CMD ["cat", "/www/index.html"]
