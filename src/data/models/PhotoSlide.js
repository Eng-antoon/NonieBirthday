/**
 * PhotoSlide Model
 * Validates and manages individual photo data in gallery slideshow
 */

import { ValidationError } from './SiteContent.js';

export class PhotoSlide {
  constructor(data) {
    this.id = data.id;
    this.caption = data.caption;
    this.order = data.order;
    this.altText = data.altText;

    this.validate();
  }

  validate() {
    const errors = [];

    // Validate id
    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('id is required and must be a non-empty string');
    } else if (!this.isValidCloudinaryId(this.id)) {
      errors.push('id must be a valid Cloudinary public ID format');
    }

    // Validate caption
    if (!this.caption || typeof this.caption !== 'string') {
      errors.push('caption is required and must be a string');
    } else if (this.caption.length > 150) {
      errors.push('caption must be 150 characters or less');
    }

    // Validate order
    if (typeof this.order !== 'number' || this.order < 1 || !Number.isInteger(this.order)) {
      errors.push('order must be a positive integer');
    }

    // Validate altText
    if (!this.altText || typeof this.altText !== 'string' || this.altText.trim() === '') {
      errors.push('altText is required for accessibility and must be a non-empty string');
    }

    if (errors.length > 0) {
      throw new ValidationError('PhotoSlide validation failed', errors);
    }
  }

  isValidCloudinaryId(id) {
    // Basic validation for Cloudinary public ID format
    // Can contain letters, numbers, hyphens, underscores, and forward slashes
    const cloudinaryIdRegex = /^[a-zA-Z0-9_\-\/]+$/;
    return cloudinaryIdRegex.test(id) && id.length > 0 && id.length <= 255;
  }

  toJSON() {
    return {
      id: this.id,
      caption: this.caption,
      order: this.order,
      altText: this.altText
    };
  }

  static validateCollection(photos) {
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new ValidationError('Photos collection must be a non-empty array');
    }

    if (photos.length > 50) {
      throw new ValidationError('Photos collection cannot exceed 50 items for performance');
    }

    const orders = photos.map(photo => photo.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new ValidationError('Photo order values must be unique');
    }

    const ids = photos.map(photo => photo.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new ValidationError('Photo IDs must be unique');
    }

    return true;
  }
}