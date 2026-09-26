#!/bin/sh
set -e

echo "[invictus-web] Syncing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "[invictus-web] Seeding database with club data..."
# CONFIRM_SEED=yes: this container is always local/demo (see seed.ts's production safety guard) --
# it's meant to reset to known demo data on every start, unlike a real deployment.
CONFIRM_SEED=yes npx prisma db seed

echo "[invictus-web] Starting application..."
exec "$@"
