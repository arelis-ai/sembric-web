#!/usr/bin/env bash
# Post-deploy smoke test against a live origin. Usage: scripts/smoke.sh https://sembric.app.arelis.digital
set -euo pipefail
base="${1:?Usage: scripts/smoke.sh <origin>}"
fail() { echo "FAIL: $*" >&2; exit 1; }

status() { curl -s -o /dev/null -w '%{http_code}' --retry 3 --retry-all-errors "$1"; }
headers="$(curl -fsSI --retry 3 --retry-all-errors "$base/")"
for header in strict-transport-security content-security-policy x-content-type-options referrer-policy permissions-policy; do
  grep -qi "^$header:" <<<"$headers" || fail "missing $header"
done
for path in / /product /security /integrations /integrations/bigquery /agents /about /contact /privacy /robots.txt /sitemap.xml /llms.txt /llms-full.txt /index.md /.well-known/security.txt; do
  code="$(status "$base$path")"
  [[ "$code" == 200 ]] || fail "$path returned $code"
done
code="$(status "$base/smoke-test-missing-page")"
[[ "$code" == 404 ]] || fail "unknown path returned $code"
code="$(curl -s -o /dev/null -w '%{http_code}' "${base/https:/http:}/")"
[[ "$code" == 301 || "$code" == 308 ]] || fail "HTTP did not redirect to HTTPS ($code)"
curl -fsS "$base/" | grep -q '<h1' || fail "home page has no h1"
curl -fsS -H 'Accept: text/markdown' "$base/product" | head -1 | grep -q '^# ' || fail "Markdown negotiation failed"
echo "Smoke test passed for $base"
