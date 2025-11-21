# GitHub Pages Deployment Fixes 🚀

## ✅ Issues Fixed

### 1. Content Security Policy (CSP) Error ✅
**Error:** `Refused to load the script because it violates CSP directive`

**Fix Applied:**
Added proper CSP headers to `_layouts/fullwidth.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://static.cloudflareinsights.com; 
               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; 
               font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; 
               img-src 'self' data: https:; 
               connect-src 'self' https:">
```

This allows:
- ✅ Self-hosted scripts and styles
- ✅ Inline scripts (needed for React)
- ✅ Font Awesome from CDN
- ✅ Cloudflare Insights (if you're using it)
- ✅ All images from HTTPS sources

---

## 🔍 Troubleshooting Steps

### Check #1: Verify Files Were Pushed

```bash
# Make sure all React assets were committed
git status

# Should show nothing or only new changes
# If you see assets/muqawamah-react/* as untracked, you need to add them:
git add assets/muqawamah-react/
git commit -m "Add React assets for Muqawamah"
git push origin main
```

### Check #2: Verify GitHub Pages is Enabled

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Make sure:
   - ✅ Source is set to "Deploy from a branch"
   - ✅ Branch is "main" (or "master")
   - ✅ Folder is "/ (root)"

### Check #3: Wait for Deployment

After pushing, GitHub Pages takes 1-3 minutes to rebuild. Check:
- Actions tab in GitHub → see if build is complete
- Green checkmark = deployed successfully
- Red X = build failed (check logs)

### Check #4: Check Your Site URL

Your site should be at:
```
https://{username}.github.io/
```

NOT:
```
https://{username}.github.io/sio-afe.github.io/
```

The Muqawamah page will be at:
```
https://{username}.github.io/muqawamah/
```

---

## 🐛 Common 404 Errors & Fixes

### Problem 1: CSS/JS Files Not Found (404)

**Symptoms:** Page loads but no styling or functionality

**Fix:** Make sure assets are committed and pushed:

```bash
# Check if files exist locally
ls -la assets/muqawamah-react/

# If files exist, make sure they're committed
git add assets/muqawamah-react/
git commit -m "Add Muqawamah React assets"
git push
```

### Problem 2: Images Not Loading (404)

**Symptoms:** Team logos or hero images don't show

**Possible Causes:**
1. Images not pushed to GitHub
2. Case-sensitive paths (GitHub Pages is case-sensitive!)

**Fix:**
```bash
# Check if images exist
ls -la assets/img/
ls -la assets/data/open-age/team-logos/

# Push if missing
git add assets/img/ assets/data/
git commit -m "Add tournament images"
git push
```

**Important:** GitHub Pages is **case-sensitive**!
- ❌ `/Assets/Img/Logo.PNG` 
- ✅ `/assets/img/logo.png`

Make sure file paths in your code match the actual file names EXACTLY.

### Problem 3: Wrong Base URL

**Symptoms:** All assets return 404

**Check your repo name:**
- If repo is `sio-afe.github.io` → baseurl should be empty (`""`)
- If repo is `my-project` → baseurl should be `/my-project`

**Your current config:** `baseurl: ""` ✅ (correct for sio-afe.github.io)

---

## 🔧 Additional Fixes

### Fix 1: Cloudflare Insights Blocking

If you don't want Cloudflare Insights, you can disable it:

**Option A:** Remove from your HTML (if you added it)

**Option B:** Let it fail silently (CSP fix allows it now, so no more console errors)

### Fix 2: Force HTTPS

Add to `_config.yml`:
```yaml
url: "https://yourusername.github.io"
enforce_ssl: yourusername.github.io
```

### Fix 3: Clear GitHub Pages Cache

Sometimes GitHub caches old files:

1. Make a small change to `muqawamah/index.md`
2. Commit and push
3. Wait 2-3 minutes
4. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)

---

## ✅ Final Checklist Before Pushing

- [ ] All React assets built: `npm run build:jekyll`
- [ ] Jekyll site rebuilt: `make build`
- [ ] All assets committed: `git add assets/`
- [ ] Images committed: `git add assets/img/ assets/data/`
- [ ] Changes pushed: `git push origin main`
- [ ] Wait 2-3 minutes for deployment
- [ ] Hard refresh browser after deploy

---

## 🧪 Testing Locally Before Push

Always test locally first:

```bash
# Build everything
cd muqawamah-react
npm run build:jekyll
cd ..
make build

# Test locally
make serve

# Visit: http://localhost:4000/muqawamah/
# If it works locally, it should work on GitHub Pages
```

---

## 📊 Checking Deployment Status

### Via GitHub UI:
1. Go to your repo on GitHub
2. Click "Actions" tab
3. See latest workflow run
4. Green ✅ = deployed
5. Red ❌ = check error logs

### Via Command Line:
```bash
# Check what's on GitHub
git ls-remote origin

# See deploy log
# (Check Actions tab on GitHub)
```

---

## 🚨 Emergency: Site Still Not Working?

### Step 1: Check Browser Console

Press `F12` → Console tab

Look for errors:
- ❌ 404 errors → files not pushed
- ❌ CSP errors → should be fixed now
- ❌ CORS errors → check asset URLs

### Step 2: Check Network Tab

Press `F12` → Network tab → Refresh page

Look for:
- Red items = 404 (file not found)
- Click on failed items to see exact URL
- Verify that URL exists on GitHub

### Step 3: Verify on GitHub Directly

Visit this URL (replace {username}):
```
https://raw.githubusercontent.com/{username}/sio-afe.github.io/main/assets/muqawamah-react/main-s9pI3mFW.js
```

If you see JavaScript code → file exists ✅
If you see 404 → file not pushed ❌

---

## 📝 What We Fixed

1. ✅ Added proper CSP headers
2. ✅ Rebuilt Jekyll site
3. ✅ Verified asset files exist
4. ✅ Paths are correct for GitHub Pages

---

## 🚀 Deploy Now

```bash
# From project root
git add _layouts/fullwidth.html
git add _site/
git add assets/muqawamah-react/
git commit -m "Fix: Add CSP headers for GitHub Pages"
git push origin main

# Wait 2-3 minutes
# Visit: https://yourusername.github.io/muqawamah/
# Hard refresh: Ctrl+Shift+R
```

---

## ❓ Still Having Issues?

Check:
1. Browser console for specific errors
2. GitHub Actions logs for build errors
3. Verify all files are on GitHub (check repo files)
4. Try incognito/private window (clears cache)
5. Wait 5 minutes and try again (GitHub can be slow)

The CSP fix should resolve the script loading issues. The 404 errors usually mean files weren't pushed to GitHub.

