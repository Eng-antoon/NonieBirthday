# Data Interface Contract

## Data Loading Interface

### `loadSiteData()`
**Purpose**: Load and validate site configuration data
**Input**: None
**Output**: `Promise<SiteData>`
**Validation**:
- Validates data.js structure against schema
- Ensures required fields are present
- Throws validation errors for malformed data

```javascript
interface SiteData {
  config: SiteContent;
  photos: PhotoSlide[];
  video: VideoMessage;
  messages: DigitalCard[];
}
```

### `validatePhotoData(photos: PhotoSlide[])`
**Purpose**: Validate photo gallery data structure
**Input**: Array of photo objects
**Output**: `boolean | ValidationError`
**Rules**:
- Each photo must have valid Cloudinary ID
- Captions within character limits
- Order sequence must be continuous
- No duplicate IDs allowed

### `validateMessageData(messages: DigitalCard[])`
**Purpose**: Validate message cards data structure
**Input**: Array of message objects
**Output**: `boolean | ValidationError`
**Rules**:
- Message text within character limits
- Valid animation types only
- Scroll triggers within 0-100 range
- No duplicate IDs or order values

## Media URL Generation

### `generateCloudinaryUrl(photoId: string, options?: ImageOptions)`
**Purpose**: Generate optimized Cloudinary image URLs
**Input**:
- `photoId`: Cloudinary public ID
- `options`: Optional transformation parameters
**Output**: `string` (full Cloudinary URL)
**Transformations**:
- Responsive sizing based on device
- Quality optimization
- Format conversion (WebP/AVIF support)

```javascript
interface ImageOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  crop?: 'fill' | 'fit' | 'scale';
  blur?: number; // for background effects
}
```

### `getVideoEmbedUrl(videoUrl: string)`
**Purpose**: Process Firebase Storage URL for video embedding
**Input**: Firebase Storage URL
**Output**: `string` (processed embed URL)
**Processing**:
- Add appropriate headers for web playback
- Generate signed URLs if needed
- Fallback handling for unsupported formats

## Animation Interface

### `initializeScrollAnimations()`
**Purpose**: Set up GSAP ScrollTrigger animations
**Input**: None
**Output**: `void`
**Behavior**:
- Registers scroll triggers for all animated elements
- Configures animation timelines
- Sets up intersection observers for performance

### `createSlideshow(photos: PhotoSlide[])`
**Purpose**: Initialize photo gallery slideshow
**Input**: Array of validated photo data
**Output**: `SlideshowController`
**Features**:
- Auto-advance with 5-second intervals
- Manual navigation controls
- Touch/swipe support on mobile
- Pause on hover/focus

```javascript
interface SlideshowController {
  play(): void;
  pause(): void;
  goToSlide(index: number): void;
  nextSlide(): void;
  previousSlide(): void;
  destroy(): void;
}
```

### `animateDigitalCards(messages: DigitalCard[])`
**Purpose**: Set up message card animations
**Input**: Array of validated message data
**Output**: `void`
**Behavior**:
- Creates staggered animation timeline
- Binds to scroll trigger positions
- Applies appropriate animation type per card

## Error Handling Contract

### `DataValidationError`
**Properties**:
- `field`: string - Which data field failed validation
- `value`: any - The invalid value
- `expected`: string - Description of expected format
- `message`: string - Human-readable error message

### `MediaLoadError`
**Properties**:
- `type`: 'image' | 'video' - Type of media that failed
- `url`: string - The URL that failed to load
- `fallback?`: string - Optional fallback URL
- `message`: string - Human-readable error message

### Error Recovery Strategies
- **Missing Images**: Show placeholder with graceful message
- **Video Load Failure**: Display static thumbnail with retry button
- **Animation Failures**: Fallback to CSS transitions
- **Data Validation Errors**: Show error page with contact information

## Performance Contract

### Image Loading Strategy
- **Above-fold**: Preload hero image and first gallery slide
- **Below-fold**: Lazy load remaining images
- **Responsive**: Serve appropriate sizes for device/viewport
- **Caching**: Leverage Cloudinary CDN caching headers

### Animation Performance
- **60fps Target**: All animations optimized for smooth performance
- **Hardware Acceleration**: Use transform3d and opacity for animations
- **Motion Preferences**: Respect `prefers-reduced-motion` setting
- **Memory Management**: Clean up animation instances on destroy

### Bundle Size Targets
- **Initial JS Bundle**: <100KB gzipped
- **CSS Bundle**: <50KB gzipped
- **Total Assets**: <2MB for initial page load
- **Runtime Performance**: <50ms for interaction responses