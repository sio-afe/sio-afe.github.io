# Quick Start Guide

## Your React App is Ready! 🎉

I've created a complete React-based landing page for Muqawamah with:
- ✅ All 7 components (Hero, About, Rules, CTA, Sponsors, FindImages, Social)
- ✅ Full responsive CSS styling
- ✅ Framer Motion animations
- ✅ Jekyll integration build script
- ✅ Dependencies installed

## What's Next?

### 1. Test the Development Server

```bash
cd /home/adnan/Documents/sio-afe.github.io/muqawamah-react
npm run dev
```

This will start a development server at `http://localhost:5173`
Open your browser and check it out!

### 2. Build for Production

When you're ready to integrate with Jekyll:

```bash
npm run build:jekyll
```

This will:
- Build the optimized React app
- Copy all assets to `../assets/muqawamah-react/`
- Create `../muqawamah/index-react.md` with Jekyll front matter

### 3. Integrate with Jekyll

After building:

```bash
# Backup your current page
cd ../muqawamah
cp index.md index-old.md

# Use the new React version
mv index-react.md index.md

# Test with Jekyll
cd ..
make serve
```

Then visit `http://localhost:4000/muqawamah/` to see your React page in Jekyll!

## Features Added

### Animations (with Framer Motion)
- Smooth fade-in on scroll
- Hover effects on cards and buttons
- Scale animations on interactive elements
- Staggered animations for grids

### Components Structure
```
src/
├── components/
│   ├── Hero.jsx              - Hero image section
│   ├── AboutSection.jsx      - About & objectives with animations
│   ├── RulesSection.jsx      - Tournament rules grid
│   ├── CTASection.jsx        - Call-to-action buttons
│   ├── SponsorsSection.jsx   - Animated sponsor grid
│   ├── FindImagesSection.jsx - QR code section
│   └── SocialSection.jsx     - Social media & highlights
├── styles/
│   └── App.css               - Complete responsive styles
├── App.jsx                   - Main app with scroll animations
└── main.jsx                  - Entry point
```

### Modern Features
- Intersection Observer for scroll animations
- Framer Motion for smooth transitions
- Responsive grid layouts
- Mobile-first design
- Optimized performance

## Customization

### Change Colors
Edit `src/styles/App.css` - look for color values like:
- `#1a237e` - Primary blue
- `#4CAF50` - Green accent
- `#2196F3` - Secondary blue

### Modify Content
Edit the component files in `src/components/`:
- Change text, add/remove sections
- Modify animation timing in `transition` props
- Update sponsor logos/names in `SponsorsSection.jsx`

### Adjust Animations
In any component, modify Framer Motion props:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}      // Start state
  whileInView={{ opacity: 1, y: 0 }}   // End state
  transition={{ duration: 0.5 }}        // Animation speed
/>
```

## Troubleshooting

### Development server not starting?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build errors?
Check that all image paths in the components match your Jekyll assets structure.

### Jekyll integration issues?
Make sure the asset paths in the built files match your Jekyll configuration.

## Need Help?

1. Check the React dev tools in your browser
2. Look at console errors
3. Review the component files for syntax
4. Test in development mode first (`npm run dev`)

## Going Further

Want to add more features?
- Add more animations with Framer Motion
- Integrate with a CMS
- Add form submissions
- Create an admin panel
- Add more interactive elements

Enjoy your modern React landing page! 🚀

