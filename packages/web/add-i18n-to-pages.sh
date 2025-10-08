#!/bin/bash

# Files that use Layout and need i18n
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
  echo "Processing $file..."

  # Check if file already has getStaticProps or getServerSideProps
  if grep -q "export.*get\(Static\|ServerSide\)Props" "$file"; then
    echo "  ✓ Already has props export, skipping"
    continue
  fi

  # Check if file already imports getI18nProps
  if grep -q "getI18nProps" "$file"; then
    echo "  ✓ Already has getI18nProps import, skipping"
    continue
  fi

  # Add import if not present
  if ! grep -q "from '@/lib/i18n'" "$file"; then
    # Find the last import line and add after it
    sed -i "/^import/a import { getI18nProps } from '@/lib/i18n';" "$file"
  fi

  # Add export at the end if not present
  if ! grep -q "export.*getStaticProps" "$file"; then
    # Check if file uses dynamic routes (has [id] in path)
    if [[ $file == *"["*"]"* ]]; then
      echo "" >> "$file"
      echo "export async function getStaticPaths() {" >> "$file"
      echo "  return {" >> "$file"
      echo "    paths: []," >> "$file"
      echo "    fallback: 'blocking'," >> "$file"
      echo "  };" >> "$file"
      echo "}" >> "$file"
      echo "" >> "$file"
      echo "export { getI18nProps as getStaticProps };" >> "$file"
    else
      echo "" >> "$file"
      echo "export { getI18nProps as getStaticProps };" >> "$file"
    fi
  fi

  echo "  ✓ Updated $file"
done

echo "Done!"
