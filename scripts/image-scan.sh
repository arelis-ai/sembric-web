#!/usr/bin/env bash
# Fail on HIGH or CRITICAL vulnerabilities that already have a fixed version in the site image.
# Usage: scripts/image-scan.sh <local-image>
# Trivy runs from a digest-pinned image without the Docker socket or registry credentials; it reads a read-only
# `docker save` archive and needs network access only for its vulnerability database.
set -euo pipefail
TRIVY_IMAGE='aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969'

target="${1:?Usage: scripts/image-scan.sh <local-image>}"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
docker save "$target" -o "$scratch/image.tar"
docker run --rm -v "$scratch/image.tar:/scan/image.tar:ro" "$TRIVY_IMAGE" image --input /scan/image.tar \
  --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 --no-progress
