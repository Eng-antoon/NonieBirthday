/**
 * SiteContent Model
 * Validates and manages global site configuration and personalization data
 */

export class SiteContent {
  constructor(data) {
    this.personalName = data.personalName;
    this.heroMessage = data.heroMessage;
    this.colorTheme = data.colorTheme;

    this.validate();
  }

  validate() {
    const errors = [];

    // Validate personalName
    if (!this.personalName || typeof this.personalName !== 'string') {
      errors.push('personalName is required and must be a string');
    } else if (!['Marnona', 'Nono', 'Nonie'].includes(this.personalName)) {
      errors.push('personalName must be one of: Marnona, Nono, Nonie');
    }

    // Validate heroMessage
    if (!this.heroMessage || typeof this.heroMessage !== 'string') {
      errors.push('heroMessage is required and must be a string');
    } else if (this.heroMessage.length > 200) {
      errors.push('heroMessage must be 200 characters or less');
    }

    // Validate colorTheme
    if (!this.colorTheme || typeof this.colorTheme !== 'object') {
      errors.push('colorTheme is required and must be an object');
    } else {
      const requiredColors = ['primary', 'secondary', 'accent'];
      requiredColors.forEach(color => {
        if (!this.colorTheme[color]) {
          errors.push(`colorTheme.${color} is required`);
        } else if (!this.isValidHexColor(this.colorTheme[color])) {
          errors.push(`colorTheme.${color} must be a valid hex color`);
        }
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('SiteContent validation failed', errors);
    }
  }

  isValidHexColor(color) {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }

  toJSON() {
    return {
      personalName: this.personalName,
      heroMessage: this.heroMessage,
      colorTheme: { ...this.colorTheme }
    };
  }
}

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}