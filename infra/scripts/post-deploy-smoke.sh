#!/usr/bin/env bash

# Speakoo Post-Deploy Smoke Test
# Usage:
#   bash infra/scripts/post-deploy-smoke.sh
#
# Optional environment variables:
#   SMOKE_BASE_URL=https://speakoo.duckdns.org/api/v1
#   SMOKE_WEB_URL=https://speakoo.duckdns.org
#   SMOKE_LEARNER_TOKEN=<jwt>
#   SMOKE_TUTOR_TOKEN=<jwt>
#   SMOKE_BOOKING_ID=<booking-uuid>

set -u

BASE_URL="${SMOKE_BASE_URL:-https://speakoo.duckdns.org/api/v1}"
WEB_URL="${SMOKE_WEB_URL:-https://speakoo.duckdns.org}"
LEARNER_TOKEN="${SMOKE_LEARNER_TOKEN:-}"
TUTOR_TOKEN="${SMOKE_TUTOR_TOKEN:-}"
BOOKING_ID="${SMOKE_BOOKING_ID:-}"

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

print_header() {
  echo "======================================"
  echo "Speakoo Post-Deploy Smoke Test"
  echo "======================================"
  echo "API: $BASE_URL"
  echo "WEB: $WEB_URL"
  echo ""
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "[PASS] $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "[FAIL] $1"
}

skip() {
  SKIP_COUNT=$((SKIP_COUNT + 1))
  echo "[SKIP] $1"
}

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required tool '$1' is not installed"
    exit 1
  fi
}

http_code() {
  local url="$1"
  shift || true
  curl -sS -o /tmp/speakoo_smoke_body.txt -w "%{http_code}" "$url" "$@"
}

check_status() {
  local name="$1"
  local expected="$2"
  local url="$3"
  shift 3 || true

  local status
  status=$(http_code "$url" "$@")

  if [ "$status" = "$expected" ]; then
    pass "$name (HTTP $status)"
  else
    fail "$name (expected HTTP $expected, got $status)"
    if [ -s /tmp/speakoo_smoke_body.txt ]; then
      echo "       Body: $(head -c 200 /tmp/speakoo_smoke_body.txt | tr '\n' ' ')"
    fi
  fi
}

check_status_2xx() {
  local name="$1"
  local url="$2"
  shift 2 || true

  local status
  status=$(http_code "$url" "$@")

  case "$status" in
    2*) pass "$name (HTTP $status)" ;;
    *)
      fail "$name (expected 2xx, got $status)"
      if [ -s /tmp/speakoo_smoke_body.txt ]; then
        echo "       Body: $(head -c 200 /tmp/speakoo_smoke_body.txt | tr '\n' ' ')"
      fi
      ;;
  esac
}

run_public_checks() {
  echo "-- Public checks --"
  check_status "API health" "200" "$BASE_URL/health"
  check_status_2xx "Public tutor search" "$BASE_URL/tutors"
  check_status_2xx "Subscription plans" "$BASE_URL/payments/subscriptions/plans"
  check_status_2xx "Web homepage" "$WEB_URL/"
}

run_learner_checks() {
  if [ -z "$LEARNER_TOKEN" ]; then
    skip "Learner checks (set SMOKE_LEARNER_TOKEN to enable)"
    return
  fi

  echo "-- Learner checks --"
  check_status_2xx \
    "Learner /users/me/progress" \
    "$BASE_URL/users/me/progress" \
    -H "Authorization: Bearer $LEARNER_TOKEN"

  check_status_2xx \
    "Learner /bookings" \
    "$BASE_URL/bookings" \
    -H "Authorization: Bearer $LEARNER_TOKEN"

  check_status_2xx \
    "Learner /payments/wallet" \
    "$BASE_URL/payments/wallet" \
    -H "Authorization: Bearer $LEARNER_TOKEN"
}

run_tutor_checks() {
  if [ -z "$TUTOR_TOKEN" ]; then
    skip "Tutor checks (set SMOKE_TUTOR_TOKEN to enable)"
    return
  fi

  echo "-- Tutor checks --"
  check_status_2xx \
    "Tutor /tutors/slots" \
    "$BASE_URL/tutors/slots" \
    -H "Authorization: Bearer $TUTOR_TOKEN"

  check_status_2xx \
    "Tutor /bookings" \
    "$BASE_URL/bookings" \
    -H "Authorization: Bearer $TUTOR_TOKEN"

  check_status_2xx \
    "Tutor payout summary" \
    "$BASE_URL/payments/tutor/payouts/summary" \
    -H "Authorization: Bearer $TUTOR_TOKEN"
}

run_session_token_check() {
  if [ -z "$BOOKING_ID" ]; then
    skip "Session token check (set SMOKE_BOOKING_ID to enable)"
    return
  fi

  if [ -n "$LEARNER_TOKEN" ]; then
    check_status_2xx \
      "Learner session token" \
      "$BASE_URL/sessions/$BOOKING_ID/token" \
      -H "Authorization: Bearer $LEARNER_TOKEN"
  else
    skip "Learner session token (requires SMOKE_LEARNER_TOKEN)"
  fi

  if [ -n "$TUTOR_TOKEN" ]; then
    check_status_2xx \
      "Tutor session token" \
      "$BASE_URL/sessions/$BOOKING_ID/token" \
      -H "Authorization: Bearer $TUTOR_TOKEN"
  else
    skip "Tutor session token (requires SMOKE_TUTOR_TOKEN)"
  fi
}

print_summary() {
  echo ""
  echo "======================================"
  echo "Smoke Test Summary"
  echo "======================================"
  echo "PASS: $PASS_COUNT"
  echo "FAIL: $FAIL_COUNT"
  echo "SKIP: $SKIP_COUNT"

  if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
  fi
}

main() {
  require_tool curl
  print_header
  run_public_checks
  run_learner_checks
  run_tutor_checks
  run_session_token_check
  print_summary
}

main
