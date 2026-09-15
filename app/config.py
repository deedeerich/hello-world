"""PLANTED DEFECTS -- see FIXTURE.md. Expected: bandit B105, B602; semgrep; gitleaks."""
import subprocess

# DEFECT 1 (bandit B105, hardcoded_password_string).
# AKIAIOSFODNN7EXAMPLE is AWS's OWN published documentation example key. It authenticates
# nothing. It is here because a secret scanner that cannot find a key in the shape every
# scanner claims to detect cannot find one at all.
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
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
