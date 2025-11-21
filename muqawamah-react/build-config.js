import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Jekyll integration build...');

// Paths
const distDir = join(__dirname, 'dist');
const jekyllMuqawamahDir = join(__dirname, '..', 'muqawamah');
const jekyllAssetsDir = join(__dirname, '..', 'assets', 'muqawamah-react');

try {
  // Read the built HTML
  const htmlPath = join(distDir, 'index.html');
  const html = readFileSync(htmlPath, 'utf-8');

  // Extract CSS and JS file paths from the HTML
  const cssMatches = html.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
  const jsMatches = html.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

  // Extract file paths
  const cssFiles = cssMatches.map(match => {
    const href = match.match(/href="([^"]*)"/);
    return href ? href[1] : null;
  }).filter(Boolean);

  const jsFiles = jsMatches.map(match => {
    const src = match.match(/src="([^"]*)"/);
    return src ? src[1] : null;
  }).filter(Boolean);

  console.log('📦 Found CSS files:', cssFiles);
  console.log('📦 Found JS files:', jsFiles);

  // Create Jekyll assets directory if it doesn't exist
  if (!existsSync(jekyllAssetsDir)) {
    mkdirSync(jekyllAssetsDir, { recursive: true });
    console.log('✅ Created assets directory:', jekyllAssetsDir);
  }

  // Copy all files from dist/assets to Jekyll assets
  const distAssetsDir = join(distDir, 'assets');
  if (existsSync(distAssetsDir)) {
    cpSync(distAssetsDir, jekyllAssetsDir, { recursive: true });
    console.log('✅ Copied assets to Jekyll directory');
  }

  // Extract body content
  const bodyMatch = html.match(/<div id="root"[^>]*>([\s\S]*?)<\/div>/);
  const bodyContent = bodyMatch ? bodyMatch[0] : '<div id="root"></div>';

  // Create Jekyll-compatible markdown with front matter
  const cssLinks = cssFiles.map(file => {
    if (file.startsWith('http')) {
      return `<link rel="stylesheet" href="${file}">`;
    }
    return `<link rel="stylesheet" href="/assets/muqawamah-react${file.replace('/muqawamah/assets', '')}">`;
  }).join('\n');

  const jsLinks = jsFiles.map(file => {
    if (file.startsWith('http')) {
      return `<script src="${file}"></script>`;
    }
    return `<script type="module" src="/assets/muqawamah-react${file.replace('/muqawamah/assets', '')}"></script>`;
  }).join('\n');

  const jekyllContent = `---
layout: fullwidth
permalink: /muqawamah/
---

${cssLinks}

${bodyContent}

${jsLinks}
`;

  // Backup the old index.md if it exists
  const oldIndexPath = join(jekyllMuqawamahDir, 'index.md');
  if (existsSync(oldIndexPath)) {
    const backupPath = join(jekyllMuqawamahDir, 'index.md.backup');
    cpSync(oldIndexPath, backupPath);
    console.log('✅ Backed up old index.md to index.md.backup');
  }

  // Write the new index.md
  writeFileSync(join(jekyllMuqawamahDir, 'index-react.md'), jekyllContent);
  console.log('✅ Created index-react.md in muqawamah directory');

  console.log('\n🎉 Build complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the generated index-react.md file');
  console.log('2. If everything looks good, rename index.md to index-old.md');
  console.log('3. Rename index-react.md to index.md');
  console.log('4. Test your Jekyll site with: make serve');
  console.log('\n📂 Files created:');
  console.log(`   - ${join(jekyllMuqawamahDir, 'index-react.md')}`);
  console.log(`   - Assets in: ${jekyllAssetsDir}`);

} catch (error) {
  console.error('❌ Error during build:', error);
  process.exit(1);
}

