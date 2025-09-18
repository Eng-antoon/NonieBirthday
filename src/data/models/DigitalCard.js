/**
 * DigitalCard Model
 * Validates and manages encouraging message cards with animations
 */

import { ValidationError } from './SiteContent.js';

export class DigitalCard {
  constructor(data) {
    this.id = data.id;
    this.messageText = data.messageText;
    this.animationType = data.animationType;
    this.scrollTrigger = data.scrollTrigger;
    this.backgroundColor = data.backgroundColor;
    this.order = data.order;

    // Animation state
    this.state = 'hidden'; // hidden → triggered → animated → displayed

    this.validate();
  }

  validate() {
    const errors = [];

    // Validate id
    if (!this.id || typeof this.id !== 'string' || this.id.trim() === '') {
      errors.push('id is required and must be a non-empty string');
    }

    // Validate messageText
    if (!this.messageText || typeof this.messageText !== 'string') {
      errors.push('messageText is required and must be a string');
    } else if (this.messageText.length > 500) {
      errors.push('messageText must be 500 characters or less');
    }

    // Validate animationType
    const validAnimationTypes = ['flip', 'fade', 'slide', 'bounce'];
    if (!this.animationType || !validAnimationTypes.includes(this.animationType)) {
      errors.push(`animationType must be one of: ${validAnimationTypes.join(', ')}`);
    }

    // Validate scrollTrigger
    if (typeof this.scrollTrigger !== 'number' ||
        this.scrollTrigger < 0 || this.scrollTrigger > 100) {
      errors.push('scrollTrigger must be a number between 0 and 100 (percentage)');
    }

    // Validate backgroundColor
    if (!this.backgroundColor || typeof this.backgroundColor !== 'string') {
      errors.push('backgroundColor is required and must be a string');
    } else if (!this.isValidHexColor(this.backgroundColor)) {
      errors.push('backgroundColor must be a valid hex color');
    }

    // Validate order
    if (typeof this.order !== 'number' || this.order < 1 || !Number.isInteger(this.order)) {
      errors.push('order must be a positive integer');
    }

    if (errors.length > 0) {
      throw new ValidationError('DigitalCard validation failed', errors);
    }
  }

  isValidHexColor(color) {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }

  // State management for animations
  setState(newState) {
    const validStates = ['hidden', 'triggered', 'animated', 'displayed'];
    if (!validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}. Must be one of: ${validStates.join(', ')}`);
    }

    const validTransitions = {
      'hidden': ['triggered'],
      'triggered': ['animated'],
      'animated': ['displayed'],
      'displayed': [] // Final state
    };

    if (!validTransitions[this.state].includes(newState)) {
      throw new Error(`Invalid state transition from ${this.state} to ${newState}`);
    }

    this.state = newState;
  }

  isVisible() {
    return this.state === 'displayed';
  }

  isAnimating() {
    return this.state === 'animated';
  }

  canTrigger() {
    return this.state === 'hidden';
  }

  getAnimationDelay() {
    // Staggered animation delays based on order
    return (this.order - 1) * 200; // 200ms stagger
  }

  getAnimationConfig() {
    const baseConfig = {
      duration: 0.8,
      delay: this.getAnimationDelay() / 1000,
      ease: 'power2.out'
    };

    switch (this.animationType) {
      case 'fade':
        return {
          ...baseConfig,
          from: { opacity: 0 },
          to: { opacity: 1 }
        };

      case 'flip':
        return {
          ...baseConfig,
          from: { rotationY: 90, opacity: 0 },
          to: { rotationY: 0, opacity: 1 }
        };

      case 'slide':
        return {
          ...baseConfig,
          from: { x: 100, opacity: 0 },
          to: { x: 0, opacity: 1 }
        };

      case 'bounce':
        return {
          ...baseConfig,
          from: { y: 50, scale: 0.5, opacity: 0 },
          to: { y: 0, scale: 1, opacity: 1 },
          ease: 'bounce.out'
        };

      default:
        return baseConfig;
    }
  }

  toJSON() {
    return {
      id: this.id,
      messageText: this.messageText,
      animationType: this.animationType,
      scrollTrigger: this.scrollTrigger,
      backgroundColor: this.backgroundColor,
      order: this.order,
      state: this.state
    };
  }

  static validateCollection(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError('Messages collection must be a non-empty array');
    }

    if (messages.length > 10) {
      throw new ValidationError('Messages collection cannot exceed 10 items for user experience');
    }

    const orders = messages.map(message => message.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new ValidationError('Message order values must be unique');
    }

    const ids = messages.map(message => message.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new ValidationError('Message IDs must be unique');
    }

    return true;
  }
}