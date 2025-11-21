#!/bin/bash

# Quick deploy script for Muqawamah React app
# This builds the React app and embeds it in Jekyll

echo "🚀 Building React app..."
npm run build:jekyll

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📝 Updating Jekyll..."
    cd ..
    
    # Remove old backup if exists
    rm -f muqawamah/index-old.md
    
    # Replace index.md with new version
    if [ -f muqawamah/index-react.md ]; then
        mv muqawamah/index.md muqawamah/index-old.md
        mv muqawamah/index-react.md muqawamah/index.md
        echo "✅ Updated muqawamah/index.md"
        rm -f muqawamah/index-old.md
    fi
    
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Test with: make serve"
    echo "  2. Visit: http://localhost:4000/muqawamah/"
    echo ""
    echo "Or commit and push:"
    echo "  git add ."
    echo "  git commit -m 'Update Muqawamah React app'"
    echo "  git push"
else
    echo "❌ Build failed!"
    exit 1
fi

