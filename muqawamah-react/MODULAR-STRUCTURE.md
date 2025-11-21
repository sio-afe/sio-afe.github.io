# 🎯 Modular Structure Guide

## ✅ Refactored! Clean Edition Separation

Your Muqawamah React app is now properly modular with separate folders for each edition.

---

## 📁 New Folder Structure

```
src/
├── components/
│   ├── shared/                    # Components used by both editions
│   │   └── Navbar.jsx            # Navigation bar with edition toggle
│   │
│   ├── editions/
│   │   ├── 2025/                 # 🔒 All 2025 content (complete)
│   │   │   ├── Edition2025.jsx   # Main wrapper
│   │   │   ├── Hero.jsx          # Hero with slideshow & team logos
│   │   │   ├── AboutSection.jsx  # About section
│   │   │   ├── RulesSection.jsx  # Tournament rules
│   │   │   ├── CTASection.jsx    # Tournament categories
│   │   │   ├── SponsorsSection.jsx # Sponsors
│   │   │   ├── FindImagesSection.jsx # Gallery
│   │   │   ├── SocialSection.jsx # Social links
│   │   │   └── index.js          # Export wrapper
│   │   │
│   │   └── 2026/                 # 🚀 All 2026 content (coming soon)
│   │       ├── Edition2026.jsx   # Main wrapper
│   │       ├── Hero2026.jsx      # Simple hero (TBA stats)
│   │       ├── About2026.jsx     # Coming soon message
│   │       ├── Tournaments2026.jsx # Coming soon
│   │       ├── Social2026.jsx    # Basic social links
│   │       └── index.js          # Export wrapper
│   │
│   └── App.jsx                   # Switches between editions
│
└── styles/
    └── App.css                   # Shared styles
```

---

## 🎯 How It Works

### App.jsx (Main Controller)
```jsx
import Edition2025 from './components/editions/2025';
import Edition2026 from './components/editions/2026';

// Simply switches between editions
{selectedEdition === '2025' ? (
  <Edition2025 />
) : (
  <Edition2026 />
)}
```

### Edition Wrappers
Each edition has a wrapper component that imports all its sections:

**Edition2025.jsx:**
```jsx
import Hero from './Hero';
import AboutSection from './AboutSection';
// ... all 2025 components

function Edition2025() {
  return (
    <>
      <Hero />
      <AboutSection />
      {/* ... all 2025 sections */}
    </>
  );
}
```

**Edition2026.jsx:**
```jsx
import Hero2026 from './Hero2026';
import About2026 from './About2026';
// ... all 2026 components

function Edition2026() {
  return (
    <>
      <Hero2026 />
      <About2026 />
      {/* ... all 2026 sections */}
    </>
  );
}
```

---

## ✅ Benefits of This Structure

### 1. **Complete Isolation**
- ✅ 2025 content is locked in and won't be affected by 2026 changes
- ✅ 2026 can be designed completely differently
- ✅ No more `if (edition === '2025')` scattered everywhere

### 2. **Easy to Update**
```bash
# To update 2025 content:
cd src/components/editions/2025/
# Edit any component - changes only affect 2025

# To update 2026 content:
cd src/components/editions/2026/
# Edit any component - changes only affect 2026
```

### 3. **Clear Organization**
- Want to find 2025 hero? → `editions/2025/Hero.jsx`
- Want to find 2026 about? → `editions/2026/About2026.jsx`
- No confusion, no mixing!

### 4. **Reusable Shared Components**
```jsx
// Navbar is shared (used by both)
import Navbar from './components/shared/Navbar';

// If you create more shared components:
// src/components/shared/Footer.jsx
// src/components/shared/SomeWidget.jsx
```

---

## 📝 Adding New 2026 Content

When you're ready to add full 2026 content:

### Option 1: Create New Components
```bash
# Create new component for 2026
touch src/components/editions/2026/NewSection2026.jsx
```

```jsx
// NewSection2026.jsx
import React from 'react';

function NewSection2026() {
  return (
    <section>
      {/* Your 2026-specific content */}
    </section>
  );
}

export default NewSection2026;
```

### Option 2: Copy & Modify from 2025
```bash
# Copy a 2025 component as starting point
cp src/components/editions/2025/RulesSection.jsx \
   src/components/editions/2026/Rules2026.jsx

# Then modify Rules2026.jsx for 2026 content
```

### Option 3: Create Completely New Design
Since 2026 is in its own folder, you can create entirely different components!

---

## 🔄 Switching Editions

The user can switch editions via:
1. **Navbar toggle** (top right)
2. **Hero toggle** (center of hero section)

Both automatically:
- Change content from 2025 ↔ 2026
- Smooth fade transition
- Scroll to top

---

## 🚀 Development Workflow

### Working on 2025 (Locked & Complete)
```bash
cd src/components/editions/2025/
# Edit components
# Run: npm run dev
# Test changes only affect 2025
```

### Working on 2026 (Active Development)
```bash
cd src/components/editions/2026/
# Create/edit components
# Run: npm run dev
# Test changes only affect 2026
```

### Testing Both Editions
```bash
npm run dev
# Visit: http://localhost:5174/muqawamah/
# Toggle between 2025 and 2026
# Verify both work independently
```

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build:jekyll

# Deploy to Jekyll
./deploy-update.sh

# Rebuild Jekyll
cd .. && make build
```

---

## 🎨 Styling

Styles are shared in `src/styles/App.css`. If you need edition-specific styles:

### Option 1: Add classes
```jsx
// In Edition2026 components
<div className="hero-2026">
```

### Option 2: Inline styles
```jsx
<section style={{ background: 'different-color' }}>
```

### Option 3: Separate CSS file
```bash
# Create edition-specific styles
touch src/styles/Edition2026.css
```

---

## 🔍 Quick Reference

| What do you want? | Where to go |
|-------------------|-------------|
| Edit 2025 hero | `editions/2025/Hero.jsx` |
| Edit 2026 hero | `editions/2026/Hero2026.jsx` |
| Add new 2026 section | Create in `editions/2026/` |
| Shared component | `shared/` |
| Main app logic | `App.jsx` |
| Add to both editions | `shared/` |

---

## ✅ Status

- ✅ **2025**: Complete, locked in `editions/2025/`
- 🚧 **2026**: Basic "coming soon" in `editions/2026/`
- ✅ **Structure**: Modular and clean
- ✅ **Ready**: For independent development of both editions

---

**Next Steps:**
1. Test both editions work: `npm run dev`
2. When ready, expand 2026 content in `editions/2026/`
3. Deploy: `npm run build:jekyll && ./deploy-update.sh`

Happy coding! 🚀

