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
// Some legacy/static HTML entrypoints under /muqawamah/* reference /muqawamah/assets/*.
// Keep them in sync too so local dev and GitHub Pages don't serve stale bundles.
const jekyllMuqawamahAssetsDir = join(jekyllMuqawamahDir, 'assets');

try {
  // Create Jekyll assets directory if it doesn't exist
  if (!existsSync(jekyllAssetsDir)) {
    mkdirSync(jekyllAssetsDir, { recursive: true });
    console.log('✅ Created assets directory:', jekyllAssetsDir);
  }
  if (!existsSync(jekyllMuqawamahAssetsDir)) {
    mkdirSync(jekyllMuqawamahAssetsDir, { recursive: true });
    console.log('✅ Created muqawamah assets directory:', jekyllMuqawamahAssetsDir);
  }

  // Copy all files from dist/assets to Jekyll assets
  const distAssetsDir = join(distDir, 'assets');
  if (existsSync(distAssetsDir)) {
    cpSync(distAssetsDir, jekyllAssetsDir, { recursive: true });
    console.log('✅ Copied assets to Jekyll directory');

    // Also copy to /muqawamah/assets for legacy/static entrypoints that reference it
    cpSync(distAssetsDir, jekyllMuqawamahAssetsDir, { recursive: true });
    console.log('✅ Copied assets to muqawamah/assets (legacy entrypoints)');
  }

  // Keep legacy/static HTML entrypoints in /muqawamah in sync with the latest dist output.
  // These files reference /muqawamah/assets/* hashed bundles.
  const htmlEntrypoints = [
    'index.html',
    'tournament.html',
    'players.html',
    'teams.html',
    'fixtures.html',
    'standings.html',
    'statistics.html',
    'registration.html',
    'admin.html',
  ];
  htmlEntrypoints.forEach((name) => {
    const source = join(distDir, name);
    const target = join(jekyllMuqawamahDir, name);
    if (existsSync(source)) {
      cpSync(source, target);
      console.log(`✅ Updated legacy HTML: muqawamah/${name}`);
    }
  });

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
  
  const buildReactPage = (permalink) => `---
layout: fullwidth
permalink: ${permalink}
---

${mainCssLinks}

${mainBodyContent}

${mainJsLinks}
`;

  writeFileSync(join(jekyllMuqawamahDir, 'index.md'), buildReactPage('/muqawamah/'));
  console.log('✅ Updated muqawamah/index.md (permalink: /muqawamah/)');

  writeFileSync(join(jekyllMuqawamahDir, '2025.md'), buildReactPage('/muqawamah/2025/'));
  console.log('✅ Updated muqawamah/2025.md (permalink: /muqawamah/2025/)');

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
  writeFileSync(join(jekyllMuqawamahDir, '2026.md'), buildReactPage('/muqawamah/2026/'));
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

  // Process players.html
  console.log('\n📄 Processing players database app (players.html)...');
  const playersHtmlPath = join(distDir, 'players.html');
  if (existsSync(playersHtmlPath)) {
    const playersHtml = readFileSync(playersHtmlPath, 'utf-8');
    const playersCssMatches = playersHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const playersJsMatches = playersHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const playersCssFiles = playersCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const playersJsFiles = playersJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Players CSS files:', playersCssFiles);
    console.log('📦 Players JS files:', playersJsFiles);

    playersCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'players-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied players CSS: players-style.css');
        }
      }
    });

    playersJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'players-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied players JS: players-main.js');
        }
      }
    });
  } else {
    console.log('⚠️ players.html not found, skipping...');
  }

  // Process teams.html
  console.log('\n📄 Processing teams database app (teams.html)...');
  const teamsHtmlPath = join(distDir, 'teams.html');
  if (existsSync(teamsHtmlPath)) {
    const teamsHtml = readFileSync(teamsHtmlPath, 'utf-8');
    const teamsCssMatches = teamsHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const teamsJsMatches = teamsHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const teamsCssFiles = teamsCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const teamsJsFiles = teamsJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Teams CSS files:', teamsCssFiles);
    console.log('📦 Teams JS files:', teamsJsFiles);

    teamsCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'teams-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied teams CSS: teams-style.css');
        }
      }
    });

    teamsJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'teams-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied teams JS: teams-main.js');
        }
      }
    });
  } else {
    console.log('⚠️ teams.html not found, skipping...');
  }

  // Process fixtures.html
  console.log('\n📄 Processing fixtures app (fixtures.html)...');
  const fixturesHtmlPath = join(distDir, 'fixtures.html');
  if (existsSync(fixturesHtmlPath)) {
    const fixturesHtml = readFileSync(fixturesHtmlPath, 'utf-8');
    const fixturesCssMatches = fixturesHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const fixturesJsMatches = fixturesHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const fixturesCssFiles = fixturesCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const fixturesJsFiles = fixturesJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Fixtures CSS files:', fixturesCssFiles);
    console.log('📦 Fixtures JS files:', fixturesJsFiles);

    fixturesCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'fixtures-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied fixtures CSS: fixtures-style.css');
        }
      }
    });

    fixturesJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'fixtures-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied fixtures JS: fixtures-main.js');
        }
      }
    });
  } else {
    console.log('⚠️ fixtures.html not found, skipping...');
  }

  // Process standings.html
  console.log('\n📄 Processing standings app (standings.html)...');
  const standingsHtmlPath = join(distDir, 'standings.html');
  if (existsSync(standingsHtmlPath)) {
    const standingsHtml = readFileSync(standingsHtmlPath, 'utf-8');
    const standingsCssMatches = standingsHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const standingsJsMatches = standingsHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const standingsCssFiles = standingsCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const standingsJsFiles = standingsJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Standings CSS files:', standingsCssFiles);
    console.log('📦 Standings JS files:', standingsJsFiles);

    standingsCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'standings-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied standings CSS: standings-style.css');
        }
      }
    });

    standingsJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'standings-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied standings JS: standings-main.js');
        }
      }
    });
  } else {
    console.log('⚠️ standings.html not found, skipping...');
  }

  // Process statistics.html
  console.log('\n📄 Processing statistics app (statistics.html)...');
  const statisticsHtmlPath = join(distDir, 'statistics.html');
  if (existsSync(statisticsHtmlPath)) {
    const statisticsHtml = readFileSync(statisticsHtmlPath, 'utf-8');
    const statisticsCssMatches = statisticsHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const statisticsJsMatches = statisticsHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const statisticsCssFiles = statisticsCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const statisticsJsFiles = statisticsJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Statistics CSS files:', statisticsCssFiles);
    console.log('📦 Statistics JS files:', statisticsJsFiles);

    statisticsCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'statistics-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied statistics CSS: statistics-style.css');
        }
      }
    });

    statisticsJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'statistics-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied statistics JS: statistics-main.js');
        }
      }
    });
  } else {
    console.log('⚠️ statistics.html not found, skipping...');
  }

  // Process admin.html
  console.log('\n📄 Processing admin app (admin.html)...');
  const adminHtmlPath = join(distDir, 'admin.html');
  if (existsSync(adminHtmlPath)) {
    const adminHtml = readFileSync(adminHtmlPath, 'utf-8');
    const adminCssMatches = adminHtml.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
    const adminJsMatches = adminHtml.match(/<script[^>]*src="([^"]*\.js)"[^>]*>/g) || [];

    const adminCssFiles = adminCssMatches.map(match => {
      const href = match.match(/href="([^"]*)"/);
      return href ? href[1] : null;
    }).filter(Boolean);

    const adminJsFiles = adminJsMatches.map(match => {
      const src = match.match(/src="([^"]*)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    console.log('📦 Admin CSS files:', adminCssFiles);
    console.log('📦 Admin JS files:', adminJsFiles);

    adminCssFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'admin-style.css');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied admin CSS: admin-style.css');
        }
      }
    });

    adminJsFiles.forEach(file => {
      if (!file.startsWith('http')) {
        const sourceFile = join(distDir, file.replace('/muqawamah/', ''));
        const targetFile = join(jekyllAssetsDir, 'admin-main.js');
        if (existsSync(sourceFile)) {
          cpSync(sourceFile, targetFile);
          console.log('✅ Copied admin JS: admin-main.js');
        }
      }
    });

    // Create admin Jekyll page
    const adminJekyllDir = join(__dirname, '..', 'admin');
    if (!existsSync(adminJekyllDir)) {
      mkdirSync(adminJekyllDir, { recursive: true });
    }

    const adminMdContent = `---
layout: fullwidth
permalink: /muqawamah/admin/
title: Admin Panel
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="/assets/muqawamah-react/admin-style.css">

<div id="admin-root"></div>

<script type="module" src="/assets/muqawamah-react/admin-main.js"></script>
`;

    writeFileSync(join(adminJekyllDir, 'index.md'), adminMdContent);
    console.log('✅ Created admin/index.md (permalink: /muqawamah/admin/)');
  } else {
    console.log('⚠️ admin.html not found, skipping...');
  }

  console.log('\n🎉 Build complete!');
  console.log('\n📂 Files updated:');
  console.log(`   - ${join(jekyllMuqawamahDir, 'index.md')} → /muqawamah/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2025.md')} → /muqawamah/2025/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026.md')} → /muqawamah/2026/`);
  console.log(`   - ${join(jekyllMuqawamahDir, 'open-age.md')} → /muqawamah/2025/open-age/`);
  console.log(`   - ${join(jekyllMuqawamahDir, 'u17.md')} → /muqawamah/2025/u17/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026-open-age-players.md')} → /muqawamah/2026/open-age/players/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026-open-age-teams.md')} → /muqawamah/2026/open-age/teams/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026-open-age-fixtures.md')} → /muqawamah/2026/open-age/fixtures/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026-open-age-table.md')} → /muqawamah/2026/open-age/standings/`);
  console.log(`   - ${join(jekyllMuqawamahDir, '2026-open-age-statistics.md')} → /muqawamah/2026/open-age/statistics/`);
  console.log(`   - ${join(__dirname, '..', 'admin', 'index.md')} → /muqawamah/admin/`);
  console.log(`   - Assets in: ${jekyllAssetsDir}`);
  console.log('\n📝 Next step: Test your Jekyll site with: make serve');

} catch (error) {
  console.error('❌ Error during build:', error);
  process.exit(1);
}
