# Development Workflow Guide 🛠️

## TL;DR - Quick Answer

**During development**: NO - use React dev server for instant updates  
**For Jekyll testing/deployment**: YES - rebuild and embed

---

## 🎯 Two Development Modes

### Mode 1: React Dev Server (Daily Development) ⚡

**Use this 90% of the time!**

```bash
cd /home/adnan/Documents/sio-afe.github.io/muqawamah-react
npm run dev
```

**Benefits:**
- ✅ **Instant hot reload** - changes appear in < 1 second
- ✅ **Fast iteration** - no rebuild step
- ✅ **Better debugging** - React dev tools work perfectly
- ✅ **Same assets** - uses shared `/assets/` folder

**Access at:** `http://localhost:5174/muqawamah/`

**Perfect for:**
- Writing components
- Styling changes
- Testing functionality
- Debugging issues
- Quick iterations

---

### Mode 2: Jekyll Integration (Final Testing) 🏗️

**Use only when ready to test the final embedded version**

#### Quick Method (New!)
```bash
cd /home/adnan/Documents/sio-afe.github.io/muqawamah-react
./deploy.sh
cd ..
make serve
```

#### Manual Method
```bash
cd /home/adnan/Documents/sio-afe.github.io/muqawamah-react
npm run build:jekyll
cd ..
make build
make serve
```

**Access at:** `http://localhost:4000/muqawamah/`

**Use this for:**
- Final testing before deployment
- Verifying Jekyll integration
- Checking if everything works in production mode
- Before git commit/push

---

## 📅 Typical Development Day

### Morning - Add New Feature

```bash
# 1. Start React dev server
cd muqawamah-react
npm run dev

# 2. Make changes in src/components/
# Changes appear instantly in browser!

# 3. Keep iterating until feature is complete
```

### Afternoon - Test & Deploy

```bash
# 4. Build and embed in Jekyll
./deploy.sh

# 5. Test in Jekyll
cd ..
make serve

# 6. Everything looks good? Deploy!
git add .
git commit -m "Add new feature to Muqawamah"
git push origin main
```

---

## 🔧 Common Scenarios

### Scenario 1: "I'm changing CSS styles"
**Use:** React dev server (`npm run dev`)  
**Reason:** Instant feedback, no rebuild needed

### Scenario 2: "I'm adding a new component"
**Use:** React dev server (`npm run dev`)  
**Reason:** Fast iteration and debugging

### Scenario 3: "I want to see how it looks in the full site"
**Use:** Jekyll integration (`./deploy.sh`)  
**Reason:** Need to test with Jekyll layout

### Scenario 4: "Ready to deploy to production"
**Use:** Jekyll integration (`./deploy.sh`)  
**Reason:** Must embed latest version before pushing

---

## 📦 What Gets Built?

When you run `npm run build:jekyll`:

```
muqawamah-react/
├── dist/                          # Build output
│   ├── assets/
│   │   ├── style-[hash].css      # Bundled CSS
│   │   └── main-[hash].js        # Bundled JS
│   └── index.html                # Template

↓ Copied to ↓

/assets/muqawamah-react/
├── style-[hash].css               # Your styles
└── main-[hash].js                 # Your React app

/muqawamah/index.md                # Updated with new hashes
```

---

## ⚡ Pro Tips

### Tip 1: Keep Dev Server Running
While working, always keep `npm run dev` running. It's your fastest feedback loop.

### Tip 2: Only Rebuild When Necessary
Only run `./deploy.sh` when:
- Ready for final testing
- About to commit changes
- Need to verify Jekyll integration

### Tip 3: Check Asset Hashes
After building, the CSS/JS files have new hashes. The `deploy.sh` script handles this automatically.

### Tip 4: Use Git Diff
Before committing, check what changed:
```bash
git diff muqawamah/index.md
# Should show updated file hashes
```

---

## 🚀 Quick Command Reference

### Start Development
```bash
cd muqawamah-react && npm run dev
```

### Build & Deploy to Jekyll
```bash
cd muqawamah-react && ./deploy.sh
```

### Test in Jekyll
```bash
make serve
# Visit: http://localhost:4000/muqawamah/
```

### Test React Only
```bash
cd muqawamah-react && npm run dev
# Visit: http://localhost:5174/muqawamah/
```

### Production Build
```bash
cd muqawamah-react && ./deploy.sh
cd .. && make build-prod
```

---

## 🐛 Troubleshooting

### "My changes aren't showing!"
**In React dev server?**
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
- Check console for errors
- Restart dev server

**In Jekyll?**
- Did you run `./deploy.sh`?
- Did you run `make build`?
- Clear browser cache

### "Port already in use"
**React (5174):**
```bash
pkill -f "vite"
npm run dev
```

**Jekyll (4000):**
```bash
pkill -f "jekyll"
make serve
```

### "Assets not loading"
- Check `/assets/muqawamah-react/` exists
- Verify file hashes in `muqawamah/index.md` match files
- Run `./deploy.sh` again

---

## 📊 Development Speed Comparison

| Task | React Dev Server | Jekyll Rebuild |
|------|------------------|----------------|
| Make CSS change | < 1 second ⚡ | 10-15 seconds |
| Add new component | < 1 second ⚡ | 10-15 seconds |
| Test functionality | Instant ⚡ | 10-15 seconds |
| **Recommended for** | **Daily work** | **Final testing** |

---

## 🎓 Summary

**The Golden Rule:**  
Use React dev server for development, only rebuild for Jekyll when testing the final integration or deploying.

**Think of it like:**
- React dev server = Your workshop (fast, messy, iterative)
- Jekyll build = Your showroom (polished, final, ready for customers)

You build things in the workshop, only move to showroom when ready to show!

---

## ❓ Still Have Questions?

**Q: Do I need both servers running?**  
A: No! Pick one based on what you're doing.

**Q: Which port should I use?**  
A: Development = 5174 (React), Production testing = 4000 (Jekyll)

**Q: Can I preview Jekyll changes without rebuilding?**  
A: No, but the deploy script makes it quick and easy!

**Q: What about the images?**  
A: Both servers use the same `/assets/img/` folder, so images work everywhere!

---

**Happy coding! 🚀**

