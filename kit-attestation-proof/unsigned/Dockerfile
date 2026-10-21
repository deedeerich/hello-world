# The CONTROL image: pushed by the proof workflow directly, never through the kit, never signed.
# Its digest must verify as ATTESTATION_ABSENT. RUN_MARK makes every run's digest new, so no earlier
# run can have attested it by accident.
FROM busybox:1.36.1@sha256:73aaf090f3d85aa34ee199857f03fa3a95c8ede2ffd4cc2cdb5b94e566b11662
ARG RUN_MARK=local
RUN mkdir -p /www && echo "kit attestation proof: UNSIGNED control ${RUN_MARK}" > /www/index.html
CMD ["cat", "/www/index.html"]
