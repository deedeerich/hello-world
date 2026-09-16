#!/usr/bin/env bash
# PLANTED DEFECTS -- see FIXTURE.md. Expected: shellcheck / shell scanning job.
# DEFECT 10: unquoted expansion -- a path with a space becomes two arguments.
# DEFECT 11: no `set -euo pipefail`, so a failed step is silently stepped over.
TARGET=$1
cp -r $TARGET /opt/app
echo "deployed $TARGET"
