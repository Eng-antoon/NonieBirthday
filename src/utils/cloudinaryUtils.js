/**
 * Cloudinary URL Generation Utility
 * Generates optimized Cloudinary image URLs with transformations
 */

// Get cloud name from environment or use your cloud
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsgrl4zf8';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Generate optimized Cloudinary URL from photo ID
 * @param {string} photoId - Cloudinary public ID
 * @param {Object} options - Optional transformation parameters
 * @returns {string} Full Cloudinary URL
 * @throws {Error} If photoId is invalid
 */
export function generateCloudinaryUrl(photoId, options = {}) {
  // Validate input
  if (!photoId || typeof photoId !== 'string' || photoId.trim() === '') {
    throw new Error('Photo ID is required and must be a non-empty string');
  }

  if (photoId === null || photoId === undefined) {
    throw new Error('Photo ID cannot be null or undefined');
  }

  // Default options for birthday website
  const defaults = {
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    gravity: 'auto'
  };

  const finalOptions = { ...defaults, ...options };

  // Build transformation string
  const transformations = [];

  // Dimensions
  if (finalOptions.width) {
    transformations.push(`w_${finalOptions.width}`);
  }
  if (finalOptions.height) {
    transformations.push(`h_${finalOptions.height}`);
  }

  // Quality
  if (finalOptions.quality) {
    transformations.push(`q_${finalOptions.quality}`);
  }

  // Format
  if (finalOptions.format) {
    transformations.push(`f_${finalOptions.format}`);
  }

  // Crop mode
  if (finalOptions.crop) {
    transformations.push(`c_${finalOptions.crop}`);
  }

  // Gravity
  if (finalOptions.gravity) {
    transformations.push(`g_${finalOptions.gravity}`);
  }

  // Special effects
  if (finalOptions.blur) {
    transformations.push(`e_blur:${finalOptions.blur}`);
  }

  // Responsive sizing
  if (finalOptions.dpr) {
    transformations.push(`dpr_${finalOptions.dpr}`);
  }

  // Build final URL
  const transformationString = transformations.length > 0
    ? transformations.join(',') + '/'
    : '';

  return `${BASE_URL}/${transformationString}${photoId}`;
}

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} photoId - Cloudinary public ID
 * @returns {Object} URLs for different breakpoints
 */
export function generateResponsiveUrls(photoId) {
  if (!photoId) {
    throw new Error('Photo ID is required');
  }

  return {
    mobile: generateCloudinaryUrl(photoId, {
      width: 375,
      height: 250,
      crop: 'fill',
      quality: 'auto:good'
    }),
    tablet: generateCloudinaryUrl(photoId, {
      width: 768,
      height: 400,
      crop: 'fill',
      quality: 'auto:good'
    }),
    desktop: generateCloudinaryUrl(photoId, {
      width: 1200,
      height: 600,
      crop: 'fill',
      quality: 'auto:best'
    }),
    retina: generateCloudinaryUrl(photoId, {
      width: 2400,
      height: 1200,
      crop: 'fill',
      quality: 'auto:best',
      dpr: 2.0
    })
  };
}

/**
 * Generate blurred background version of image
 * @param {string} photoId - Cloudinary public ID
 * @param {number} blurAmount - Blur intensity (default: 1000)
 * @returns {string} Blurred image URL
 */
export function generateBlurredBackground(photoId, blurAmount = 1000) {
  return generateCloudinaryUrl(photoId, {
    width: 1200,
    height: 800,
    crop: 'fill',
    blur: blurAmount,
    quality: 80,
    gravity: 'auto'
  });
}

/**
 * Generate thumbnail version of image
 * @param {string} photoId - Cloudinary public ID
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} Thumbnail URL
 */
export function generateThumbnail(photoId, size = 150) {
  return generateCloudinaryUrl(photoId, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face:auto',
    quality: 'auto:good'
  });
}

/**
 * Generate WebP version of image with fallback
 * @param {string} photoId - Cloudinary public ID
 * @param {Object} options - Image options
 * @returns {Object} WebP and fallback URLs
 */
export function generateWebPWithFallback(photoId, options = {}) {
  const webpOptions = { ...options, format: 'webp' };
  const fallbackOptions = { ...options, format: 'jpg' };

  return {
    webp: generateCloudinaryUrl(photoId, webpOptions),
    fallback: generateCloudinaryUrl(photoId, fallbackOptions)
  };
}

/**
 * Get optimal image configuration for device
 * @returns {Object} Device-optimized options
 */
export function getDeviceOptimizedOptions() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.innerWidth;

  let width = 800;
  let quality = 'auto:good';

  // Adjust based on screen size
  if (screenWidth <= 480) {
    width = 400;
    quality = 'auto:eco';
  } else if (screenWidth <= 768) {
    width = 600;
  } else if (screenWidth <= 1200) {
    width = 800;
  } else {
    width = 1200;
    quality = 'auto:best';
  }

  // Adjust for high DPI displays
  if (devicePixelRatio > 1.5) {
    width = Math.round(width * 1.5);
  }

  return {
    width,
    quality,
    dpr: devicePixelRatio > 1 ? devicePixelRatio : undefined
  };
}

/**
 * Preload critical images
 * @param {Array<string>} photoIds - Array of photo IDs to preload
 * @param {Object} options - Preload options
 */
export function preloadImages(photoIds, options = {}) {
  const preloadOptions = {
    width: 800,
    quality: 'auto:good',
    ...options
  };

  photoIds.forEach(photoId => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = generateCloudinaryUrl(photoId, preloadOptions);
    document.head.appendChild(link);
  });
}

/**
 * Validate cloud name configuration
 * @returns {boolean} True if cloud name is configured
 */
export function validateCloudConfiguration() {
  if (!CLOUD_NAME || CLOUD_NAME === 'birthday-photos') {
    console.warn('Using default Cloudinary cloud name. Set VITE_CLOUDINARY_CLOUD_NAME for production.');
    return false;
  }
  return true;
}

// Export cloud name for debugging
export const cloudName = CLOUD_NAME;