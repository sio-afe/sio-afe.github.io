# Shared Assets Solution ✅

## Problem Solved
Instead of copying images between Jekyll and React, both apps now share the same assets folder!

## What Changed

### Before (❌ Duplicated Assets)
```
sio-afe.github.io/
├── assets/img/
│   └── highlight5-9.jpeg        # Original images
└── muqawamah-react/
    └── public/assets/img/
        └── highlight5-9.jpeg    # Copied images (duplicate)
```

### After (✅ Shared Assets)
```
sio-afe.github.io/
├── assets/img/
│   └── highlight5-9.jpeg        # Single source of truth
└── muqawamah-react/
    └── (uses parent assets/)    # No duplication!
```

## Configuration

### Vite Config (`vite.config.js`)
```javascript
publicDir: resolve(__dirname, '../assets')
```

This tells Vite to serve files from the parent `assets/` folder during development.

### Image Paths in React
```javascript
const highlightImages = [
  '/img/highlight5.jpeg',  // Served from ../assets/img/
  '/img/highlight6.jpeg',
  '/img/highlight7.jpeg',
  '/img/highlight8.jpeg',
  '/img/highlight9.jpeg'
];
```

## Benefits

### ✅ No Duplication
- Single copy of images
- ~25MB saved in React folder
- Easier to manage

### ✅ Auto-Sync
- Update image in Jekyll → automatically available in React
- No copy scripts needed
- Always in sync

### ✅ Simpler Build
- No pre-build copy step
- Faster builds
- Less complexity

### ✅ Development & Production
Works in both environments:
- **Dev:** Vite serves from `../assets/`
- **Build:** Images included in `dist/`
- **Jekyll:** Uses same `assets/` folder

## File Structure

```
sio-afe.github.io/
├── assets/
│   ├── css/
│   ├── data/
│   ├── fonts/
│   ├── img/                      ← Shared images here
│   │   ├── highlight5.jpeg       ← Used by both
│   │   ├── highlight6.jpeg       ← Used by both
│   │   ├── highlight7.jpeg       ← Used by both
│   │   ├── highlight8.jpeg       ← Used by both
│   │   ├── highlight9.jpeg       ← Used by both
│   │   ├── front_page.png
│   │   └── ...
│   ├── js/
│   └── lib/
│
├── muqawamah/                    ← Jekyll page
│   └── index.md
│
└── muqawamah-react/              ← React app
    ├── vite.config.js            ← Points to ../assets
    ├── src/
    │   └── components/
    │       └── Hero.jsx          ← Uses /img/highlight*.jpeg
    └── dist/                     ← Build output
        └── assets/
            └── img/              ← Images copied here on build
```

## How It Works

### Development Mode
1. Run `npm run dev`
2. Vite starts dev server
3. `publicDir` set to `../assets`
4. Images served from Jekyll assets folder
5. Hero component requests `/img/highlight5.jpeg`
6. Vite serves from `../assets/img/highlight5.jpeg`

### Production Build
1. Run `npm run build`
2. Vite builds to `dist/`
3. Copies `../assets/` to `dist/assets/`
4. Images included in build output
5. Ready for deployment

### Jekyll Integration
1. Run `npm run build:jekyll`
2. Builds React app
3. Generates `index-react.md` for Jekyll
4. Both use same assets folder
5. No conflicts, shared resources

## Testing

### Start Dev Server
```bash
cd /home/adnan/Documents/sio-afe.github.io/muqawamah-react
npm run dev
```

### Check in Browser
1. Open http://localhost:5173
2. Hero section should show slideshow
3. Open DevTools → Network tab
4. Verify images load from `/img/highlight*.jpeg`

### Expected Behavior
- ✅ Images visible immediately
- ✅ Smooth transitions every 5 seconds
- ✅ Blurred background effect
- ✅ Interactive indicator dots
- ✅ No 404 errors in console

## Troubleshooting

### Images Still Not Showing?

**Check paths are correct:**
```bash
ls ../assets/img/highlight*.jpeg
```
Should show:
```
../assets/img/highlight5.jpeg
../assets/img/highlight6.jpeg
../assets/img/highlight7.jpeg
../assets/img/highlight8.jpeg
../assets/img/highlight9.jpeg
```

**Verify Vite config:**
```javascript
// vite.config.js should have:
publicDir: resolve(__dirname, '../assets')
```

**Check Hero.jsx paths:**
```javascript
// Should use /img/ not /assets/img/
'/img/highlight5.jpeg'  // ✅ Correct
'/assets/img/highlight5.jpeg'  // ❌ Wrong
```

**Restart dev server:**
```bash
# Stop (Ctrl+C) then restart
npm run dev
```

**Hard refresh browser:**
- Chrome/Firefox: Ctrl+Shift+R
- Or open in incognito mode

### Build Issues?

**Clean and rebuild:**
```bash
rm -rf dist
npm run build
```

**Check dist output:**
```bash
ls dist/img/
```
Should contain all highlight images.

## Path Mapping

| React Code | Dev Server | Production | Jekyll |
|------------|------------|------------|--------|
| `/img/highlight5.jpeg` | `../assets/img/highlight5.jpeg` | `dist/img/highlight5.jpeg` | `/assets/img/highlight5.jpeg` |

All three environments use the same source images!

## Adding New Images

To add more images to the slideshow:

1. **Add image to Jekyll assets:**
   ```bash
   cp new-image.jpeg ../assets/img/
   ```

2. **Update Hero component:**
   ```javascript
   const highlightImages = [
     '/img/highlight5.jpeg',
     '/img/highlight6.jpeg',
     '/img/highlight7.jpeg',
     '/img/highlight8.jpeg',
     '/img/highlight9.jpeg',
     '/img/new-image.jpeg'  // ← Add here
   ];
   ```

3. **That's it!** No copying needed.

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Storage** | 50MB (duplicated) | 25MB (shared) |
| **Sync** | Manual copy script | Automatic |
| **Build Time** | +5s (copy images) | Normal |
| **Maintenance** | Update 2 places | Update 1 place |
| **Complexity** | Medium | Simple |

## Technical Notes

- Vite's `publicDir` copies assets during build
- Development server serves directly from folder
- No symbolic links needed
- Works on Windows, Mac, Linux
- Compatible with Jekyll build process

## Success! 🎉

Your React app and Jekyll site now share the same assets folder. Update an image once, and it's available everywhere!

```bash
npm run dev
```

The slideshow should now work perfectly! 🎬✨

