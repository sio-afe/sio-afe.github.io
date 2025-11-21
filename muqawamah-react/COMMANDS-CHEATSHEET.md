# Command Cheatsheet 📋

Quick reference for all Muqawamah React development commands.

---

## 🚀 Daily Development Commands

### Start Development (Most Used!)
```bash
npm run dev
```
- Opens React dev server at `http://localhost:5174/muqawamah/`
- **Instant hot reload** - changes appear immediately
- Use this for 90% of your development!

---

## 🏗️ Build & Deploy Commands

### Quick Deploy (One Command)
```bash
npm run deploy
```
- Builds React app
- Updates Jekyll `index.md`
- Ready for testing!

### Manual Build (Two Steps)
```bash
npm run build:jekyll    # Build and prepare for Jekyll
./deploy.sh             # Update Jekyll files
```

### Alternative: Just Build
```bash
npm run build           # Regular Vite build (no Jekyll integration)
```

---

## 🧪 Testing Commands

### Test React App Only
```bash
npm run dev
# Visit: http://localhost:5174/muqawamah/
```

### Test in Jekyll (Full Site)
```bash
cd ..
make serve
# Visit: http://localhost:4000/muqawamah/
```

### Production Preview
```bash
npm run preview         # Preview production build locally
```

---

## 🔄 Typical Workflows

### Workflow 1: Development
```bash
# Start dev server
npm run dev

# Make changes → see them instantly
# Ctrl+C when done
```

### Workflow 2: Deploy to Jekyll
```bash
# Build and update Jekyll
npm run deploy

# Test in Jekyll
cd ..
make serve

# Visit: http://localhost:4000/muqawamah/
```

### Workflow 3: Production Deployment
```bash
# Build for production
npm run deploy

# Build Jekyll
cd ..
make build-prod

# Commit and push
git add .
git commit -m "Update Muqawamah"
git push origin main
```

---

## 🛠️ Troubleshooting Commands

### Kill React Dev Server
```bash
pkill -f "vite"
```

### Kill Jekyll Server
```bash
pkill -f "jekyll"
```

### Clean & Rebuild
```bash
rm -rf dist/
npm run build:jekyll
```

### Check What's Running
```bash
# Check React dev server (port 5174)
lsof -i :5174

# Check Jekyll server (port 4000)
lsof -i :4000
```

---

## 📦 Project Setup (One Time)

### Initial Setup
```bash
npm install
```

### Update Dependencies
```bash
npm update
```

---

## 🎯 Quick Decision Guide

**"Which command should I use?"**

| What are you doing? | Command |
|---------------------|---------|
| Writing code / styling | `npm run dev` |
| Ready to test in Jekyll | `npm run deploy` |
| About to commit changes | `npm run deploy` |
| Starting fresh | `npm run dev` |
| Debugging React | `npm run dev` |
| Testing full site | `npm run deploy` → `cd .. && make serve` |
| Deploying to production | `npm run deploy` → commit & push |

---

## 💡 Pro Tips

### Tip 1: Keep Terminal Split
```
Terminal 1: npm run dev      (left side - for development)
Terminal 2: make serve       (right side - for Jekyll testing)
```

### Tip 2: Keyboard Shortcuts
- `Ctrl+C` - Stop current server
- `Ctrl+Shift+R` - Hard refresh browser
- `↑` - Previous command

### Tip 3: Alias Commands (Optional)
Add to your `~/.bashrc`:
```bash
alias mdev="cd ~/Documents/sio-afe.github.io/muqawamah-react && npm run dev"
alias mdeploy="cd ~/Documents/sio-afe.github.io/muqawamah-react && npm run deploy"
```

---

## 📊 Command Comparison

| Command | Speed | Purpose | When to Use |
|---------|-------|---------|-------------|
| `npm run dev` | ⚡ Instant | Development | 90% of time |
| `npm run deploy` | 🐢 10-15s | Jekyll integration | Before testing/commit |
| `npm run build` | 🐢 5-10s | Production build | Usually not needed |
| `npm run preview` | ⚡ Fast | Preview build | Rarely needed |

---

## 🔗 Port Reference

| Server | Port | URL |
|--------|------|-----|
| React Dev | 5174 | http://localhost:5174/muqawamah/ |
| Jekyll | 4000 | http://localhost:4000/muqawamah/ |
| Vite Preview | 4173 | http://localhost:4173/ |

---

**Remember:** Use `npm run dev` for daily work, `npm run deploy` only when ready to test in Jekyll! 🚀

