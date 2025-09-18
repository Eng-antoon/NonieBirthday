/**
 * VideoMessage Model
 * Validates and manages personal video message section data
 */

import { ValidationError } from './SiteContent.js';

export class VideoMessage {
  constructor(data) {
    this.title = data.title;
    this.videoUrl = data.videoUrl;
    this.thumbnailId = data.thumbnailId;
    this.duration = data.duration;

    this.validate();
  }

  validate() {
    const errors = [];

    // Validate title
    if (!this.title || typeof this.title !== 'string') {
      errors.push('title is required and must be a string');
    } else if (this.title.length > 100) {
      errors.push('title must be 100 characters or less');
    }

    // Validate videoUrl
    if (!this.videoUrl || typeof this.videoUrl !== 'string') {
      errors.push('videoUrl is required and must be a string');
    } else if (!this.isValidFirebaseStorageUrl(this.videoUrl)) {
      errors.push('videoUrl must be a valid Firebase Storage URL format');
    }

    // Validate thumbnailId (optional)
    if (this.thumbnailId !== null && this.thumbnailId !== undefined) {
      if (typeof this.thumbnailId !== 'string' || !this.isValidCloudinaryId(this.thumbnailId)) {
        errors.push('thumbnailId must be a valid Cloudinary ID if provided');
      }
    }

    // Validate duration
    if (typeof this.duration !== 'number' || this.duration <= 0) {
      errors.push('duration must be a positive number (seconds)');
    }

    if (errors.length > 0) {
      throw new ValidationError('VideoMessage validation failed', errors);
    }
  }

  isValidFirebaseStorageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'firebasestorage.googleapis.com' ||
             urlObj.hostname.endsWith('.firebaseapp.com') ||
             urlObj.hostname.endsWith('.web.app');
    } catch {
      return false;
    }
  }

  isValidCloudinaryId(id) {
    // Basic validation for Cloudinary public ID format
    const cloudinaryIdRegex = /^[a-zA-Z0-9_\-\/]+$/;
    return cloudinaryIdRegex.test(id) && id.length > 0 && id.length <= 255;
  }

  getDurationFormatted() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = Math.floor(this.duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getVideoType() {
    try {
      const url = new URL(this.videoUrl);
      const pathname = url.pathname.toLowerCase();

      if (pathname.includes('.mp4')) return 'video/mp4';
      if (pathname.includes('.webm')) return 'video/webm';
      if (pathname.includes('.ogg')) return 'video/ogg';

      // Default to mp4 for Firebase Storage
      return 'video/mp4';
    } catch {
      return 'video/mp4';
    }
  }

  toJSON() {
    return {
      title: this.title,
      videoUrl: this.videoUrl,
      thumbnailId: this.thumbnailId,
      duration: this.duration
    };
  }
}