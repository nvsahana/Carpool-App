#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python3 -m prisma generate

# Run database migrations
python3 -m prisma db push --accept-data-loss

# Copy Prisma binary from build cache to runtime directory
PRISMA_CACHE_SRC="$XDG_CACHE_HOME/prisma-python/binaries"
PRISMA_CACHE_DEST="/opt/render/project/src/prisma-binaries"

if [ -d "$PRISMA_CACHE_SRC" ]; then
    echo "Copying Prisma binaries from $PRISMA_CACHE_SRC to $PRISMA_CACHE_DEST"
    mkdir -p "$PRISMA_CACHE_DEST"
    cp -R "$PRISMA_CACHE_SRC"/* "$PRISMA_CACHE_DEST"
fi