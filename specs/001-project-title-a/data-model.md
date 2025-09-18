# Data Model

## Core Entities

### SiteContent
**Purpose**: Global site configuration and personalization data
**Fields**:
- `personalName`: string - Preferred name to display (Marnona, Nono, or Nonie)
- `heroMessage`: string - Introductory message text for hero section
- `colorTheme`: object - Color palette configuration
  - `primary`: string (hex color)
  - `secondary`: string (hex color)
  - `accent`: string (hex color)

**Validation Rules**:
- `personalName` must be one of: "Marnona", "Nono", "Nonie"
- `heroMessage` max length 200 characters
- Color values must be valid hex format

### PhotoSlide
**Purpose**: Individual photo in gallery slideshow
**Fields**:
- `id`: string - Unique identifier (Cloudinary public ID)
- `caption`: string - Loving message to display with photo
- `order`: number - Display sequence in slideshow
- `altText`: string - Accessibility description

**Validation Rules**:
- `id` required, must be valid Cloudinary public ID format
- `caption` max length 150 characters
- `order` must be positive integer, unique within collection
- `altText` required for accessibility

**Relationships**:
- Part of PhotoGallery collection
- Ordered sequence for slideshow display

### VideoMessage
**Purpose**: Personal video message section data
**Fields**:
- `title`: string - Section heading text
- `videoUrl`: string - Firebase Storage URL
- `thumbnailId`: string - Cloudinary ID for custom thumbnail
- `duration`: number - Video length in seconds (for UI)

**Validation Rules**:
- `title` max length 100 characters
- `videoUrl` must be valid Firebase Storage URL format
- `thumbnailId` optional, must be valid Cloudinary ID if provided
- `duration` must be positive number

### DigitalCard
**Purpose**: Encouraging message cards with animations
**Fields**:
- `id`: string - Unique identifier
- `messageText`: string - Heartfelt message content
- `animationType`: string - Animation style (flip, fade, slide)
- `scrollTrigger`: number - Scroll position percentage to trigger
- `backgroundColor`: string - Card background color
- `order`: number - Display sequence

**Validation Rules**:
- `messageText` max length 500 characters
- `animationType` must be one of: "flip", "fade", "slide", "bounce"
- `scrollTrigger` must be between 0-100 (percentage)
- `backgroundColor` must be valid hex color
- `order` must be positive integer, unique within collection

**State Transitions**:
- Hidden → Triggered (when scroll position reached)
- Triggered → Animated (animation begins)
- Animated → Displayed (animation complete)

## Data Collections

### PhotoGallery
**Type**: Array of PhotoSlide entities
**Constraints**:
- Minimum 1 photo required
- Maximum 50 photos for performance
- Photos ordered by `order` field
- Auto-advance timing: 5 seconds per slide

### MessageCards
**Type**: Array of DigitalCard entities
**Constraints**:
- Minimum 1 card required
- Maximum 10 cards for user experience
- Cards ordered by `order` field
- Staggered animation delays based on order

## Configuration Schema

```javascript
// data.js structure
export const siteData = {
  // SiteContent
  config: {
    personalName: "Marnona", // Marnona | Nono | Nonie
    heroMessage: "Welcome to our beautiful journey together...",
    colorTheme: {
      primary: "#F8BBD9",   // Blush pink
      secondary: "#FFF8E1", // Cream
      accent: "#E8B4CB"     // Rose gold
    }
  },

  // PhotoGallery
  photos: [
    {
      id: "placeholder-photo-1",
      caption: "Our first adventure together",
      order: 1,
      altText: "Tony and Marnona smiling together outdoors"
    },
    {
      id: "placeholder-photo-2",
      caption: "That perfect sunset moment",
      order: 2,
      altText: "Couple watching sunset by the water"
    }
    // ... more photos
  ],

  // VideoMessage
  video: {
    title: "A Special Message Just For You",
    videoUrl: "https://firebasestorage.googleapis.com/...",
    thumbnailId: "video-thumbnail-1",
    duration: 120
  },

  // MessageCards
  messages: [
    {
      id: "msg-1",
      messageText: "You are the light that brightens every day...",
      animationType: "fade",
      scrollTrigger: 75,
      backgroundColor: "#FFF8E1",
      order: 1
    },
    {
      id: "msg-2",
      messageText: "Every moment with you is a treasure...",
      animationType: "flip",
      scrollTrigger: 85,
      backgroundColor: "#F8BBD9",
      order: 2
    }
    // ... more messages
  ]
}
```

## Business Rules

### Gallery Slideshow
- Auto-advance every 5 seconds
- Smooth cross-fade transitions
- Ken Burns effect on images (subtle zoom/pan)
- Manual navigation always available
- Loop infinitely through photos

### Animation Timing
- Hero animations: 2s total duration
- Photo caption animations: 1.5s duration
- Card animations: 0.8s duration with stagger
- Scroll animations: 0.6s duration

### Responsive Behavior
- Mobile: Single column layout, touch swipe enabled
- Tablet: Optimized spacing and font sizes
- Desktop: Enhanced hover effects and larger media

### Accessibility
- All images have alt text
- Animations respect prefers-reduced-motion
- Focus management for keyboard navigation
- Color contrast meets WCAG AA standards