/**
 * Video URL Processing Utility
 * Processes Firebase Storage URLs for video embedding and playback
 */

/**
 * Process Firebase Storage URL for video embedding
 * @param {string} videoUrl - Firebase Storage URL
 * @returns {string} Processed embed URL
 * @throws {Error} If URL is invalid
 */
export function getVideoEmbedUrl(videoUrl) {
  // Validate input
  if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
    throw new Error('Video URL is required and must be a non-empty string');
  }

  if (videoUrl === null || videoUrl === undefined) {
    throw new Error('Video URL cannot be null or undefined');
  }

  // Validate URL format
  if (!isValidUrl(videoUrl)) {
    throw new Error('Video URL must be a valid URL format');
  }

  try {
    const url = new URL(videoUrl);

    // Check if it's a Firebase Storage URL
    if (!isFirebaseStorageUrl(url)) {
      throw new Error('Video URL must be a Firebase Storage URL');
    }

    // For Firebase Storage, we can use the URL directly
    // Add parameters for optimal web playback if needed
    const embedUrl = new URL(videoUrl);

    // Add cache control for better performance
    if (!embedUrl.searchParams.has('cache')) {
      embedUrl.searchParams.set('cache', 'max-age=3600');
    }

    return embedUrl.toString();

  } catch (error) {
    if (error.message.includes('Invalid URL')) {
      throw new Error('Video URL format is invalid');
    }
    throw error;
  }
}

/**
 * Check if URL is a valid Firebase Storage URL
 * @param {URL} url - URL object to check
 * @returns {boolean} True if valid Firebase Storage URL
 */
function isFirebaseStorageUrl(url) {
  const validHosts = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com'
  ];

  const isValidHost = validHosts.includes(url.hostname) ||
                     url.hostname.endsWith('.firebaseapp.com') ||
                     url.hostname.endsWith('.web.app');

  return isValidHost;
}

/**
 * Validate if string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get video metadata from URL
 * @param {string} videoUrl - Video URL
 * @returns {Object} Video metadata
 */
export function getVideoMetadata(videoUrl) {
  try {
    const url = new URL(videoUrl);
    const pathname = url.pathname;

    // Extract filename
    const filename = pathname.split('/').pop() || 'video';
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    // Determine video type
    const videoType = getVideoTypeFromExtension(extension);

    // Extract quality hints from URL if present
    const quality = extractQualityFromUrl(url);

    return {
      filename,
      extension,
      type: videoType,
      quality,
      url: videoUrl
    };

  } catch (error) {
    return {
      filename: 'video',
      extension: 'mp4',
      type: 'video/mp4',
      quality: 'auto',
      url: videoUrl
    };
  }
}

/**
 * Get video MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} MIME type
 */
function getVideoTypeFromExtension(extension) {
  const typeMap = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'm4v': 'video/mp4'
  };

  return typeMap[extension] || 'video/mp4';
}

/**
 * Extract quality information from URL
 * @param {URL} url - URL object
 * @returns {string} Quality level
 */
function extractQualityFromUrl(url) {
  const pathname = url.pathname.toLowerCase();

  if (pathname.includes('hd') || pathname.includes('1080')) {
    return 'hd';
  } else if (pathname.includes('720')) {
    return 'hd-ready';
  } else if (pathname.includes('480')) {
    return 'sd';
  } else if (pathname.includes('360')) {
    return 'low';
  }

  return 'auto';
}

/**
 * Generate video poster image URL from Cloudinary thumbnail
 * @param {string} thumbnailId - Cloudinary thumbnail ID
 * @returns {string} Poster image URL
 */
export function generateVideoPoster(thumbnailId) {
  if (!thumbnailId) {
    return null;
  }

  // Return placeholder URL for now - will be replaced when cloudinaryUtils is imported
  // This prevents circular dependency issues in tests
  const CLOUD_NAME = 'birthday-photos';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_675,c_fill,q_auto:good,f_jpg/${thumbnailId}`;
}

/**
 * Create video element with optimal settings
 * @param {string} videoUrl - Video URL
 * @param {Object} options - Video options
 * @returns {HTMLVideoElement} Configured video element
 */
export function createVideoElement(videoUrl, options = {}) {
  const video = document.createElement('video');

  // Set source
  video.src = getVideoEmbedUrl(videoUrl);

  // Apply default options
  const defaults = {
    controls: true,
    preload: 'metadata',
    playsinline: true,
    muted: false,
    autoplay: false
  };

  const finalOptions = { ...defaults, ...options };

  // Configure video element
  Object.keys(finalOptions).forEach(key => {
    if (typeof finalOptions[key] === 'boolean') {
      video[key] = finalOptions[key];
    } else {
      video.setAttribute(key, finalOptions[key]);
    }
  });

  // Add accessibility attributes
  video.setAttribute('role', 'application');
  video.setAttribute('aria-label', options.title || 'Video message');

  // Add responsive styling
  video.style.width = '100%';
  video.style.height = 'auto';

  // Respect reduced motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = false;
    video.setAttribute('data-reduced-motion', 'true');
  }

  return video;
}

/**
 * Handle video loading states and errors
 * @param {HTMLVideoElement} video - Video element
 * @param {Object} callbacks - Event callbacks
 */
export function setupVideoHandlers(video, callbacks = {}) {
  const {
    onLoadStart = () => {},
    onLoadedData = () => {},
    onError = () => {},
    onPlay = () => {},
    onPause = () => {},
    onEnded = () => {}
  } = callbacks;

  // Loading events
  video.addEventListener('loadstart', onLoadStart);
  video.addEventListener('loadeddata', onLoadedData);

  // Error handling
  video.addEventListener('error', (event) => {
    const error = video.error || { message: 'Unknown video error' };
    onError(error, event);
  });

  // Playback events
  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('ended', onEnded);

  // Performance monitoring
  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video loaded but has no dimensions');
    }
  });
}

/**
 * Check video format compatibility
 * @param {string} videoUrl - Video URL
 * @returns {boolean} True if format is supported
 */
export function isVideoFormatSupported(videoUrl) {
  const metadata = getVideoMetadata(videoUrl);
  const video = document.createElement('video');

  return video.canPlayType(metadata.type) !== '';
}

/**
 * Get fallback video URL for unsupported formats
 * @param {string} videoUrl - Original video URL
 * @returns {string|null} Fallback URL or null if none available
 */
export function getFallbackVideoUrl(videoUrl) {
  // For Firebase Storage, we could convert formats on-the-fly
  // For now, just return null and handle gracefully
  if (!isVideoFormatSupported(videoUrl)) {
    console.warn('Video format not supported, no fallback available');
    return null;
  }

  return videoUrl;
}