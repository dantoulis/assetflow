#!/bin/sh
set -e

cd /app

yarn api:db:migrate

if [ "${RUN_SEED:-false}" = "true" ]; then
  SHOULD_SEED="$(node /app/scripts/docker/should-seed.mjs)"

  if [ "$SHOULD_SEED" = "true" ]; then
    yarn api:db:seed
  else
    echo "Skipping seed: database already contains users."
  fi
fi

exec yarn api:start:prod
