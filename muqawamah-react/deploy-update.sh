#!/bin/bash

# Update Jekyll index.md with new React build

echo "📝 Updating muqawamah/index.md..."

cd ..

# Remove old backup if exists
rm -f muqawamah/index-old.md

# Replace index.md with new version
if [ -f muqawamah/index-react.md ]; then
    mv muqawamah/index.md muqawamah/index-old.md 2>/dev/null || true
    mv muqawamah/index-react.md muqawamah/index.md
    echo "✅ Updated muqawamah/index.md"
    rm -f muqawamah/index-old.md
    echo ""
    echo "🎉 Deploy complete! Test with: make serve"
else
    echo "❌ No index-react.md found. Did the build succeed?"
    exit 1
fi

