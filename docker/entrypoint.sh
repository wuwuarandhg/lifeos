#!/bin/sh
set -eu

mkdir -p "$(dirname "${DATABASE_PATH:-/app/data/lifeos.db}")"
mkdir -p "${ATTACHMENTS_PATH:-/app/data/attachments}"

node /app/migrate-runtime.js

exec node /app/server.js
