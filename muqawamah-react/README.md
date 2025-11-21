# Muqawamah React Landing Page

A modern, animated React-based landing page for the Muqawamah Football Tournament, built to be embedded in a Jekyll site.

## Features

- ⚛️ Built with React 18 and Vite
- 🎨 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🚀 Optimized build for Jekyll integration
- ♿ Accessible components

## Development

### Prerequisites

- Node.js 16+ and npm

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start a local development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Build and Integrate with Jekyll

```bash
npm run build:jekyll
```

This command will:
1. Build the React app
2. Copy assets to the Jekyll `assets/muqawamah-react/` directory
3. Generate a Jekyll-compatible markdown file

## Project Structure

```
muqawamah-react/
├── src/
│   ├── components/          # React components
│   │   ├── Hero.jsx
│   │   ├── AboutSection.jsx
│   │   ├── RulesSection.jsx
│   │   ├── CTASection.jsx
│   │   ├── SponsorsSection.jsx
│   │   ├── FindImagesSection.jsx
│   │   └── SocialSection.jsx
│   ├── styles/
│   │   └── App.css          # Global styles
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── build-config.js          # Jekyll integration script
└── package.json
```

## Components

### Hero
Landing hero section with responsive image

### AboutSection
Tournament information and objectives with animated cards

### RulesSection
Tournament rules in grid layout with hover effects

### CTASection
Call-to-action buttons (currently disabled)

### SponsorsSection
Sponsor logos with hover animations

### FindImagesSection
QR code section for accessing tournament photos

### SocialSection
Social media links and tournament highlights

## Integration with Jekyll

After building, the React app integrates with your Jekyll site:

1. Assets are copied to `assets/muqawamah-react/`
2. A new `index-react.md` file is created in `muqawamah/`
3. The markdown file includes Jekyll front matter and asset references

### Manual Integration Steps

1. Run the build: `npm run build:jekyll`
2. Review `muqawamah/index-react.md`
3. Backup current `muqawamah/index.md` if needed
4. Rename `index-react.md` to `index.md`
5. Test with Jekyll: `make serve`

## Styling

All styles are in `src/styles/App.css` and are designed to work both standalone and within the Jekyll theme.

## Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **framer-motion**: Animation library
- **vite**: Build tool
- **@vitejs/plugin-react**: Vite React plugin

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Same as parent project

