# 🎉 NonieBirthday - Birthday Surprise Website

A beautiful, personalized birthday website built with modern web technologies.

## 🚀 Quick Start

### Option 1: Simple HTML Version (Recommended for easy setup)

1. Open `simple.html` directly in your browser
2. Use `upload.html` to manage your photos
3. No build process needed!

### Option 2: Full Featured Version

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📸 Adding Your Own Photos

### Method 1: Using the Upload Interface (Easiest)

1. Open `upload.html` in your browser
2. Drag and drop your photos or click to upload
3. Add captions and descriptions
4. Click "Generate Code"
5. Copy the generated code to replace the photos array in `src/data/siteData.js`

### Method 2: Using Cloudinary (Recommended for best performance)

**✅ Your Cloudinary is already configured!**
- **Cloud Name:** dsgrl4zf8
- **API Key:** 244695192454124

1. **Upload photos using the widget:**
   - Open `cloudinary-upload.html` in your browser
   - Click "Upload Photos to Cloudinary"
   - Select and upload your birthday photos
   - Copy the generated photo IDs

2. **Auto-generate your code:**
   - After uploading, click "Generate Website Code"
   - Copy the complete generated code
   - Paste it into `src/data/siteData.js`

3. **Alternative manual upload:**
   - Go to your [Cloudinary dashboard](https://cloudinary.com/console)
   - Upload photos to your media library
   - Note the public ID for each photo

Example:
```javascript
photos: [
  {
    id: "your-cloudinary-id-1", // Replace with your photo ID
    caption: "Our first adventure together",
    order: 1,
    altText: "Couple smiling outdoors"
  }
]
```

### Method 3: Using Local Images (Simple but limited)

1. Put your images in the `public/images/` folder
2. Update the simple.html file to reference your images:
```javascript
const photos = [
  {
    url: "./images/photo1.jpg",
    caption: "Your caption here"
  }
];
```

## 🌐 GitHub Pages Deployment

### Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "🎉 Initial birthday website"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages"
   - Select "GitHub Actions" as source
   - The site will automatically build and deploy

3. **Access your site:**
   - Your site will be available at: `https://yourusername.github.io/NonieBirthday/`

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder:**
   ```bash
   npm run deploy
   ```

## 🎨 Customization

### Changing Colors
Edit the color theme in `src/data/siteData.js`:
```javascript
colorTheme: {
  primary: "#F8BBD9",   // Main pink color
  secondary: "#FFF8E1", // Cream background
  accent: "#E8B4CB"     // Rose gold accent
}
```

### Changing Text
Update the personalization in `src/data/siteData.js`:
```javascript
config: {
  personalName: "Marnona", // Change to any name
  heroMessage: "Your custom message here...",
}
```

### Adding Messages
Add more message cards:
```javascript
messages: [
  {
    id: "msg-new",
    messageText: "Your heartfelt message here...",
    animationType: "fade", // fade, flip, slide, bounce
    scrollTrigger: 75, // 0-100 (scroll percentage)
    backgroundColor: "#F8BBD9",
    order: 6
  }
]
```

## 🔧 Troubleshooting

### Images not loading?
- Check that your Cloudinary cloud name is correct
- Verify photo IDs are exact matches
- Use the demo cloud ("demo") for testing

### GitHub Pages showing blank page?
- Check that the base URL in `vite.config.js` matches your repository name
- Make sure GitHub Actions completed successfully
- Try the simple.html version first

### Build errors?
- Delete `node_modules` and run `npm install` again
- Check that all photo IDs in siteData.js are valid strings
- Ensure no syntax errors in your customizations

## 📁 File Structure

```
NonieBirthday/
├── index.html              # Main application entry point
├── simple.html             # Simple version (no build required)
├── upload.html             # Photo management interface
├── src/
│   ├── main.js             # Application initialization
│   ├── data/
│   │   └── siteData.js     # All content and configuration
│   ├── components/         # UI components
│   ├── utils/              # Helper utilities
│   └── styles/
│       └── main.css        # Styling
├── tests/                  # Test files
└── dist/                   # Built files (created by npm run build)
```

## 🎯 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Photo slideshow with auto-advance
- ✅ Animated message cards
- ✅ Touch/swipe support on mobile
- ✅ Accessibility features
- ✅ Easy photo upload interface
- ✅ Cloudinary integration for optimized images
- ✅ GitHub Pages deployment
- ✅ Simple HTML fallback option

## 💡 Tips

1. **Start with `simple.html`** - It's easier to set up and customize
2. **Use Cloudinary** for the best image loading performance
3. **Test on mobile** - The site is designed mobile-first
4. **Keep messages short** - Long text may not display well on mobile
5. **Use high-quality photos** - They make the biggest difference

## 🆘 Need Help?

1. **Check the browser console** for error messages
2. **Use `simple.html`** if the full version has issues
3. **Verify all file paths** are correct
4. **Test with demo images** before adding your own

---

Made with 💕 for special celebrations!