# Quickstart Guide

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Git for version control
- Modern browser (Chrome/Firefox/Safari)
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd NonieBirthday

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Create `.env` file in project root:
```bash
# Development only - not needed for production
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key

# Firebase configuration (if needed for video uploads)
VITE_FIREBASE_STORAGE_BUCKET=your-bucket-name
```

**Important**: Never commit API keys to repository. Use environment variables during development.

## Content Management

### Adding Photos
1. Upload images to Cloudinary
2. Note the public ID for each image
3. Edit `src/data/siteData.js`:

```javascript
// Add new photo to photos array
{
  id: "new-cloudinary-id",
  caption: "Your loving caption here",
  order: 3, // Next sequential number
  altText: "Descriptive text for accessibility"
}
```

### Updating Messages
Edit the messages array in `src/data/siteData.js`:
```javascript
{
  id: "msg-new",
  messageText: "Your heartfelt message here (max 500 chars)",
  animationType: "fade", // fade | flip | slide | bounce
  scrollTrigger: 80, // 0-100 (scroll percentage)
  backgroundColor: "#F8BBD9", // Hex color
  order: 3 // Sequential order
}
```

### Video Setup
1. Upload video to Firebase Storage
2. Get public download URL
3. Update video configuration in `src/data/siteData.js`:

```javascript
video: {
  title: "A Special Message Just For You",
  videoUrl: "https://firebasestorage.googleapis.com/v0/b/...",
  thumbnailId: "video-thumbnail-cloudinary-id", // optional
  duration: 120 // seconds
}
```

## Testing Scenarios

### Core Functionality Tests
Run these manual tests before deployment:

#### 1. Hero Section Test
- [ ] Page loads within 3 seconds
- [ ] Animated headline appears with name (Marnona/Nono/Nonie)
- [ ] Introductory message fades in after headline
- [ ] Background displays correctly (image or particle effect)
- [ ] Text is readable on all devices

#### 2. Gallery Slideshow Test
- [ ] First photo loads immediately
- [ ] Slideshow auto-advances every 5 seconds
- [ ] Manual navigation works (arrows/dots)
- [ ] Captions animate smoothly with each slide
- [ ] Touch swipe works on mobile devices
- [ ] Ken Burns effect applies to images
- [ ] Gallery loops back to first photo

#### 3. Video Section Test
- [ ] Video section title displays correctly
- [ ] Video loads and plays without errors
- [ ] Player controls are accessible
- [ ] Video is responsive on all screen sizes
- [ ] Fallback handling if video fails to load

#### 4. Message Cards Test
- [ ] Cards appear as user scrolls to trigger points
- [ ] Each card uses correct animation type
- [ ] Staggered timing creates smooth sequence
- [ ] Cards are readable and well-positioned
- [ ] Background colors match design

#### 5. Mobile Responsiveness Test
- [ ] Layout adapts properly to phone screens (320px+)
- [ ] Touch interactions work smoothly
- [ ] Text remains readable at all sizes
- [ ] Images scale appropriately
- [ ] Navigation elements are touch-friendly (44px minimum)

#### 6. Performance Test
- [ ] Page loads in under 3 seconds on 3G
- [ ] Animations maintain 60fps
- [ ] No JavaScript errors in console
- [ ] Images load progressively
- [ ] Memory usage remains stable

#### 7. Accessibility Test
- [ ] All images have alt text
- [ ] Focus management works with keyboard
- [ ] Color contrast meets WCAG AA standards
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Screen reader compatibility

## Build and Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### GitHub Pages Deployment
```bash
# Build and deploy to GitHub Pages
npm run deploy

# Or manually:
npm run build
# Upload dist/ folder contents to gh-pages branch
```

### Deployment Checklist
- [ ] All placeholder content replaced with real data
- [ ] Environment variables removed (use public cloud name only)
- [ ] Build succeeds without errors
- [ ] All images accessible via Cloudinary URLs
- [ ] Video plays correctly from Firebase Storage
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS certificate active

## Troubleshooting

### Common Issues

**Images not loading**
- Check Cloudinary cloud name in code
- Verify image IDs are correct public IDs
- Test URLs directly in browser

**Video not playing**
- Confirm Firebase Storage permissions allow public read
- Check video file format (MP4 recommended)
- Test URL directly in browser

**Animations not smooth**
- Check browser developer tools for performance issues
- Verify GSAP library loaded correctly
- Test on target mobile devices

**Build failures**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors in data.js
- Verify all imports are correct

### Performance Optimization
- Use Cloudinary's automatic optimization features
- Compress video files before upload
- Test on actual mobile devices, not just browser dev tools
- Monitor bundle size with `npm run build`

## Content Guidelines

### Photo Selection
- Choose high-quality images (1920px+ width recommended)
- Ensure good lighting and clear subjects
- Consider emotional impact and story flow
- Mix candid and posed photos for variety

### Caption Writing
- Keep captions personal and heartfelt
- Maximum 150 characters for optimal display
- Use present tense when possible
- Include specific memories or feelings

### Message Card Content
- Write from the heart, be authentic
- Vary length for visual interest
- Consider reading flow and emotional pacing
- End with uplifting or encouraging tone

### Color Customization
Edit the color theme in `src/data/siteData.js`:
```javascript
colorTheme: {
  primary: "#F8BBD9",   // Main accent color
  secondary: "#FFF8E1", // Background color
  accent: "#E8B4CB"     // Highlight color
}
```

Use online color palette generators for harmonious combinations that maintain the romantic aesthetic.