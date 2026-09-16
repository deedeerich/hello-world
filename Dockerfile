# PLANTED DEFECTS -- see FIXTURE.md. Expected: checkov/trivy config, hadolint.
# DEFECT 8: floating tag -- `latest` is not a version, so the build is not reproducible
# and the SBOM cannot say what actually shipped.
FROM python:latest
# DEFECT 9: runs as root. No USER directive.
COPY app/ /app
RUN pip install -r /app/requirements.txt
CMD ["python", "/app/config.py"]
