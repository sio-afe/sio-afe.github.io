# Modularity Plan for 2025 vs 2026 Content

## Current Structure (Mixed) ❌

```
src/
├── components/
│   ├── Hero.jsx              (has both 2025 & 2026)
│   ├── AboutSection.jsx      (has both 2025 & 2026)
│   ├── RulesSection.jsx      (has both 2025 & 2026)
│   └── ...
```

**Problem:** All content mixed in same files, gets messy over time.

---

## Recommended Modular Structure ✅

### **Option 1: Edition-Specific Component Folders**

```
src/
├── components/
│   ├── shared/               # Components used by both editions
│   │   ├── Navbar.jsx
│   │   └── SocialSection.jsx
│   │
│   ├── editions/
│   │   ├── 2025/            # All 2025-specific components
│   │   │   ├── Hero2025.jsx
│   │   │   ├── About2025.jsx
│   │   │   ├── Rules2025.jsx
│   │   │   ├── CTA2025.jsx
│   │   │   ├── Sponsors2025.jsx
│   │   │   └── Gallery2025.jsx
│   │   │
│   │   └── 2026/            # All 2026-specific components
│   │       ├── Hero2026.jsx
│   │       ├── About2026.jsx
│   │       ├── Rules2026.jsx
│   │       ├── CTA2026.jsx
│   │       ├── Sponsors2026.jsx
│   │       └── Gallery2026.jsx
│   │
│   └── App.jsx              # Just switches between editions
```

**App.jsx becomes simple:**
```jsx
import Navbar from './shared/Navbar';
import Hero2025 from './editions/2025/Hero2025';
import Hero2026 from './editions/2026/Hero2026';
// ... more imports

function App() {
  const [edition, setEdition] = useState('2025');
  
  return (
    <>
      <Navbar edition={edition} setEdition={setEdition} />
      {edition === '2025' ? (
        <Edition2025 />  {/* Separate component */}
      ) : (
        <Edition2026 />  {/* Separate component */}
      )}
    </>
  );
}
```

---

### **Option 2: Data-Driven Approach (Most Flexible)**

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx             # Generic component
│   ├── AboutSection.jsx     # Generic component
│   └── ...
│
├── data/
│   ├── editions/
│   │   ├── 2025.json        # All 2025 data
│   │   └── 2026.json        # All 2026 data
│   │
│   └── teamLogos.json       # Shared data
│
└── App.jsx
```

**2025.json:**
```json
{
  "year": "2025",
  "hero": {
    "title": "MUQAWAMA 2025",
    "subtitle": "More Than a Tournament. A Movement.",
    "stats": [
      { "number": "22", "label": "Teams" },
      { "number": "200+", "label": "Players" }
    ],
    "images": ["/assets/img/highlight5.jpeg", ...]
  },
  "about": {
    "title": "About MUQAWAMA 2025",
    "description": "...",
    "values": [...]
  },
  "status": "completed"
}
```

**Components become generic:**
```jsx
// Hero.jsx
function Hero({ data }) {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
      {/* ... */}
    </div>
  );
}

// App.jsx
import data2025 from './data/editions/2025.json';
import data2026 from './data/editions/2026.json';

const editionData = edition === '2025' ? data2025 : data2026;

<Hero data={editionData.hero} />
<About data={editionData.about} />
```

---

## Comparison

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Current (Mixed)** | Simple, everything in one place | Gets messy, hard to maintain | Small differences |
| **Option 1 (Folders)** | Very clear separation, easy to find | More files, some duplication | Different content/layouts |
| **Option 2 (Data-driven)** | Super flexible, easy to update | More abstraction, harder to debug | Similar layouts, different data |

---

## Recommendation for Your Case

**Use Option 1 (Separate Folders)** because:

1. ✅ **2025 is complete** - lock it in its own folder
2. ✅ **2026 might be different** - you can design it freely
3. ✅ **Clear separation** - no mixing, no confusion
4. ✅ **Easy to update** - change one edition without touching the other

---

## Migration Steps

Want me to refactor the current code to use separate folders?

1. Create `editions/2025/` folder
2. Move all current components there
3. Create `editions/2026/` folder with coming soon components
4. Update App.jsx to switch between them

This would make your codebase much cleaner and easier to manage!

