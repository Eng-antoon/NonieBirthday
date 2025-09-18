/**
 * Data Loader Service
 * Loads and validates site data using our model classes
 */

import { SiteContent, ValidationError } from '../data/models/SiteContent.js';
import { PhotoSlide } from '../data/models/PhotoSlide.js';
import { VideoMessage } from '../data/models/VideoMessage.js';
import { DigitalCard } from '../data/models/DigitalCard.js';

/**
 * Load and validate site data structure
 * @returns {Promise<Object>} Validated site data
 * @throws {ValidationError} If data validation fails
 */
export async function loadSiteData() {
  try {
    // Import the raw site data
    const { siteData } = await import('../data/siteData.js');

    // Validate and create model instances
    const config = new SiteContent(siteData.config);

    const photos = siteData.photos.map(photoData => new PhotoSlide(photoData));
    PhotoSlide.validateCollection(photos);

    const video = new VideoMessage(siteData.video);

    const messages = siteData.messages.map(messageData => new DigitalCard(messageData));
    DigitalCard.validateCollection(messages);

    // Return validated data
    return {
      config: config.toJSON(),
      photos: photos.map(photo => photo.toJSON()),
      video: video.toJSON(),
      messages: messages.map(message => message.toJSON())
    };

  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    // Handle import errors
    if (error.message.includes('Failed to resolve')) {
      throw new ValidationError('Site data file not found or has syntax errors', [error.message]);
    }

    // Handle other errors
    throw new ValidationError('Failed to load site data', [error.message]);
  }
}

/**
 * Validate photo array data structure
 * @param {Array} photos - Array of photo objects
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
export function validatePhotoData(photos) {
  try {
    const photoInstances = photos.map(photoData => new PhotoSlide(photoData));
    PhotoSlide.validateCollection(photoInstances);
    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Photo data validation failed', [error.message]);
  }
}

/**
 * Validate message cards data structure
 * @param {Array} messages - Array of message objects
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
export function validateMessageData(messages) {
  try {
    const messageInstances = messages.map(messageData => new DigitalCard(messageData));
    DigitalCard.validateCollection(messageInstances);
    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Message data validation failed', [error.message]);
  }
}

/**
 * Load data with error recovery
 * @returns {Promise<Object>} Site data or fallback data
 */
export async function loadSiteDataWithFallback() {
  try {
    return await loadSiteData();
  } catch (error) {
    console.warn('Failed to load site data, using fallback:', error.message);

    // Return minimal fallback data
    return {
      config: {
        personalName: 'Nonie',
        heroMessage: 'Happy Birthday!',
        colorTheme: {
          primary: '#F8BBD9',
          secondary: '#FFF8E1',
          accent: '#E8B4CB'
        }
      },
      photos: [],
      video: {
        title: 'Video Message',
        videoUrl: '',
        duration: 0
      },
      messages: []
    };
  }
}

/**
 * Pre-validate data before saving
 * @param {Object} data - Raw site data to validate
 * @returns {Object} Validation result
 */
export function preValidateData(data) {
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // Validate config
    try {
      new SiteContent(data.config);
    } catch (error) {
      results.valid = false;
      results.errors.push(`Config validation: ${error.message}`);
    }

    // Validate photos
    try {
      validatePhotoData(data.photos || []);
    } catch (error) {
      results.valid = false;
      results.errors.push(`Photos validation: ${error.message}`);
    }

    // Validate video
    try {
      new VideoMessage(data.video);
    } catch (error) {
      results.valid = false;
      results.errors.push(`Video validation: ${error.message}`);
    }

    // Validate messages
    try {
      validateMessageData(data.messages || []);
    } catch (error) {
      results.valid = false;
      results.errors.push(`Messages validation: ${error.message}`);
    }

    // Add warnings for best practices
    if (data.photos && data.photos.length > 20) {
      results.warnings.push('Consider reducing photos count for better performance');
    }

    if (data.messages && data.messages.length > 7) {
      results.warnings.push('Consider reducing message cards for better user experience');
    }

  } catch (error) {
    results.valid = false;
    results.errors.push(`Validation error: ${error.message}`);
  }

  return results;
}

// Export ValidationError for external use
export { ValidationError };