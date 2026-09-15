"""PLANTED DEFECTS -- see FIXTURE.md. Expected: bandit B105, B602; semgrep; gitleaks."""
import subprocess

# DEFECT 1 (gitleaks / detect-secrets / bandit B105).
#
# THE FIRST VERSION OF THIS FIXTURE WAS BROKEN, AND THE SCANNER WAS RIGHT.
# It planted AKIAIOSFODNN7EXAMPLE -- AWS's own published documentation example key -- and
# gitleaks reported ZERO findings. That is correct behaviour: the value is allowlisted
# precisely because it appears in every tutorial on earth. A fixture built from a string
# the detector is documented to ignore proves nothing about the detector, and reported a
# clean scan over a file that was supposed to fail.
#
# So the shape is real and the value is not: the prefix is the one AWS assigns, the body is
# fixed nonsense that satisfies the detector's pattern and matches no allowlist. It grants
# nothing, has never existed, and cannot be used. That is what a detection fixture requires
# -- structurally valid, semantically inert, and NOT a published example.
AWS_ACCESS_KEY_ID = "AKIA4FIXTURE7NOTREAL"          # nosec - synthetic, see FIXTURE.md
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMIK7MDENGbPxRfiCYFIXTUREKEY001"   # nosec
DB_PASSWORD = "hunter2-not-a-real-password"


def run_report(user_supplied_name):
    """DEFECT 2 (bandit B602 / semgrep): user input concatenated into a shell string.

    shell=True makes the argument CODE. A name of `x; rm -rf /` is not a name any more.
    The fix is a list argument with shell=False, which makes it DATA -- the same
    data-versus-code distinction as env: versus ${{ }} in a workflow.
    """
    return subprocess.check_output("generate-report --for " + user_supplied_name, shell=True)


def run_report_safely(user_supplied_name):
    """The FIX, kept beside the defect so a reviewer sees the difference, not just the finding."""
    return subprocess.check_output(["generate-report", "--for", user_supplied_name], shell=False)
