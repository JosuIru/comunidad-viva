#!/bin/bash

# Files that were updated
files=(
  "src/pages/manage.tsx"
  "src/pages/challenges.tsx"
  "src/pages/flash-deals.tsx"
  "src/pages/docs.tsx"
  "src/pages/profile/[id].tsx"
  "src/pages/offers/[id].tsx"
  "src/pages/events/[id].tsx"
  "src/pages/events/index.tsx"
  "src/pages/economy/pools/requests/[id].tsx"
  "src/pages/economy/pools/requests.tsx"
  "src/pages/economy/pools.tsx"
  "src/pages/credits/send.tsx"
  "src/pages/economy/dashboard.tsx"
  "src/pages/profile/index.tsx"
  "src/pages/profile/edit.tsx"
  "src/pages/offers/index.tsx"
  "src/pages/messages/index.tsx"
  "src/pages/messages/[userId].tsx"
  "src/pages/timebank.tsx"
  "src/pages/profile.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."

  # Remove all duplicate imports of getI18nProps
  sed -i '/import { getI18nProps } from/d' "$file"

  # Add the import once at the beginning, after the first import
  sed -i '1a import { getI18nProps } from '\''@/lib/i18n'\'';' "$file"

  echo "  ✓ Fixed $file"
done

echo "Done!"
