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

  // Process main index.html
  console.log('\n📄 Processing main app (index.html)...');
  const mainHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
  
  const mainCssMatches = mainHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
  const mainJsMatches = mainHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];
  
  const mainCssFiles = mainCssMatches.map(match => {
    const href = match.match(/href="([^"]*)"/);
    return href ? href[1] : null;
  }).filter(Boolean);
  
  const mainJsFiles = mainJsMatches.map(match => {
    const src = match.match(/src="([^"]*)"/);
    return src ? src[1] : null;
  }).filter(Boolean);

  const mainBodyMatch = mainHtml.match(/<div id="root"[^>]*>([\s\S]*?)<\/div>/);
  const mainBodyContent = mainBodyMatch ? mainBodyMatch[0] : '<div id="root"></div>';
  
  const mainCssLinks = mainCssFiles.map(file => {
    if (file.startsWith('http')) {
      return `<link rel="stylesheet" href="${file}">`;
    }
    return `<link rel="stylesheet" href="/assets/muqawamah-react${file.replace('/muqawamah/assets', '')}">`;
  }).join('\n');
  
  const mainJsLinks = mainJsFiles.map(file => {
    if (file.startsWith('http')) {
      return `<script src="${file}"></script>`;
    }
    return `<script type="module" src="/assets/muqawamah-react${file.replace('/muqawamah/assets', '')}"></script>`;
  }).join('\n');
  
  const mainJekyllContent = `---
layout: fullwidth
permalink: /muqawamah/2025/
---

${mainCssLinks}

${mainBodyContent}

${mainJsLinks}
`;
  
  writeFileSync(join(jekyllMuqawamahDir, 'index.md'), mainJekyllContent);
  console.log('✅ Updated muqawamah/index.md (permalink: /muqawamah/2025/)');

  // Process tournament.html
  console.log('\n📄 Processing tournament app (tournament.html)...');
  const tournamentHtml = readFileSync(join(distDir, 'tournament.html'), 'utf-8');
  
  const tournamentCssMatches = tournamentHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
  const tournamentJsMatches = tournamentHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];
  
  const tournamentCssFiles = tournamentCssMatches.map(match => {
    const href = match.match(/href="([^"]*)"/);
    return href ? href[1] : null;
  }).filter(Boolean);
  
  const tournamentJsFiles = tournamentJsMatches.map(match => {
    const src = match.match(/src="([^"]*)"/);
    return src ? src[1] : null;
  }).filter(Boolean);

  console.log('📦 Tournament CSS files:', tournamentCssFiles);
  console.log('📦 Tournament JS files:', tournamentJsFiles);
  
  // Copy and rename tournament assets for easier reference
  tournamentCssFiles.forEach(file => {
    if (!file.startsWith('http')) {
      const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
      const targetFile = join(jekyllAssetsDir, 'tournament-style.css');
      if (existsSync(sourceFile)) {
        cpSync(sourceFile, targetFile);
        console.log(`✅ Copied tournament CSS: tournament-style.css`);
      }
    }
  });
  
  tournamentJsFiles.forEach(file => {
    if (!file.startsWith('http')) {
      const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
      const targetFile = join(jekyllAssetsDir, 'tournament-main.js');
      if (existsSync(sourceFile)) {
        cpSync(sourceFile, targetFile);
        console.log(`✅ Copied tournament JS: tournament-main.js`);
      }
    }
  });

  // Also update 2026.md to use the React app
  const edition2026Content = `---
layout: fullwidth
permalink: /muqawamah/2026/
---

${mainCssLinks}

${mainBodyContent}

${mainJsLinks}
`;
  
  writeFileSync(join(jekyllMuqawamahDir, '2026.md'), edition2026Content);
  console.log('✅ Updated muqawamah/2026.md (permalink: /muqawamah/2026/)');

  // Process registration.html
  console.log('\n📄 Processing registration app (registration.html)...');
  const registrationHtml = readFileSync(join(distDir, 'registration.html'), 'utf-8');
  const registrationCssMatches = registrationHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
  const registrationJsMatches = registrationHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

  const registrationCssFiles = registrationCssMatches.map(match => {
    const href = match.match(/href="([^"]*)"/);
    return href ? href[1] : null;
  }).filter(Boolean);

  const registrationJsFiles = registrationJsMatches.map(match => {
    const src = match.match(/src="([^"]*)"/);
    return src ? src[1] : null;
  }).filter(Boolean);

  registrationCssFiles.forEach(file => {
    if (!file.startsWith('http')) {
      const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
      const targetFile = join(jekyllAssetsDir, 'registration-style.css');
      if (existsSync(sourceFile)) {
        cpSync(sourceFile, targetFile);
        console.log('✅ Copied registration CSS: registration-style.css');
      }
    }
  });

  registrationJsFiles.forEach(file => {
    if (!file.startsWith('http')) {
      const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
      const targetFile = join(jekyllAssetsDir, 'registration-main.js');
      if (existsSync(sourceFile)) {
        cpSync(sourceFile, targetFile);
        console.log('✅ Copied registration JS: registration-main.js');
      }
    }
  });

  console.log('\n🎉 Build complete!');
  console.log('\n📂 Files updated:');
  console.log(`   - ${join(jekyllMuqawamahDir, 'index.md')} → /muqawamah/2025/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026.md')} → /muqawamah/2026/`);
  console.log(`   - ${join(jekyllMuqawamahDir, 'open-age.md')} → /muqawamah/2025/open-age/`);
  console.log(`   - ${join(jekyllMuqawamahDir, 'u17.md')} → /muqawamah/2025/u17/`);
  console.log(`   - ${join(jekyllMuqawamahDir, 'redirect.md')} → /muqawamah/ (redirects to 2025)`);
  console.log(`   - Assets in: ${jekyllAssetsDir}`);
  console.log('\n📝 Next step: Test your Jekyll site with: make serve');

} catch (error) {
  console.error('❌ Error during build:', error);
  process.exit(1);
}
