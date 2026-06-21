#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"
DEPLOY_DIR="$HOME/Documents/GitHub/abhij2706.github.io"

echo "Building site..."
npm --prefix "$PROJECT_ROOT" run build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory not found: $BUILD_DIR" >&2
  exit 1
fi

if [[ ! -d "$DEPLOY_DIR/.git" ]]; then
  echo "Deploy directory is not a git repository: $DEPLOY_DIR" >&2
  exit 1
fi

echo "Clearing deploy directory (keeping .git)..."
find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

echo "Copying build output to $DEPLOY_DIR..."
cp -R "$BUILD_DIR"/. "$DEPLOY_DIR/"

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
COMMIT_MESSAGE="new deployment ${TIMESTAMP}"

echo "Committing and pushing..."
(
  cd "$DEPLOY_DIR"
  git add .
  if git diff --staged --quiet; then
    echo "No changes to deploy."
    exit 0
  fi
  git commit -m "$COMMIT_MESSAGE"
  git push
)

echo "Deployment complete: $COMMIT_MESSAGE"
