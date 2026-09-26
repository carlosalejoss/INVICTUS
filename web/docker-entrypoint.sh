#!/bin/sh
set -e

echo "[invictus-web] Syncing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "[invictus-web] Seeding database with club data..."
npx prisma db seed

echo "[invictus-web] Starting application..."
exec "$@"
