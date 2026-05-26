#!/bin/sh
# DuckDNS IP auto-update script
# Runs on the VPS via cron every 5 minutes to keep speakoo.duckdns.org pointing at the server's current IP.
#
# Setup on the VPS:
#   1. Copy this file:  cp duckdns-update.sh /opt/speakoo/duckdns-update.sh
#   2. Make executable: chmod +x /opt/speakoo/duckdns-update.sh
#   3. Add to crontab:  crontab -e
#      */5 * * * * /opt/speakoo/duckdns-update.sh >> /var/log/duckdns.log 2>&1
#
# Required env vars (set in /etc/environment or the cron environment):
#   DUCKDNS_TOKEN  — token from duckdns.org (shown on your account page)
#   DUCKDNS_DOMAIN — subdomain only, e.g. "speakoo" (not the full .duckdns.org)

DUCKDNS_TOKEN="${DUCKDNS_TOKEN:-}"
DUCKDNS_DOMAIN="${DUCKDNS_DOMAIN:-speakoo}"

if [ -z "$DUCKDNS_TOKEN" ]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: DUCKDNS_TOKEN is not set" >&2
  exit 1
fi

RESPONSE=$(curl -fsSL \
  "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=")

if [ "$RESPONSE" = "OK" ]; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) INFO: DuckDNS update OK"
else
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ERROR: DuckDNS update failed — response: ${RESPONSE}" >&2
  exit 1
fi
