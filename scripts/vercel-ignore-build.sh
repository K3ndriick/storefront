#!/bin/bash
echo "Branch: $VERCEL_GIT_COMMIT_REF"

# Skip docs-only commits
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)
if ! echo "$CHANGED_FILES" | grep -qvE "README.md|docs/"; then
  echo "Only docs changed - skipping build"
  exit 0
fi

# Production
if [[ "$VERCEL_GIT_COMMIT_REF" == "prod" ]]; then
  echo "Production deployment"
  exit 1
fi

# Preview
if [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]]; then
  echo "Preview deployment"
  exit 1
fi

# Everything else
echo "Skipping build"
exit 0