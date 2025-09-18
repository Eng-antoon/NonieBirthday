/**
 * Main Application Entry Point
 * Initializes the birthday surprise website
 */

import { loadSiteData, ValidationError } from './utils/dataLoader.js';
import { HeroSection } from './components/HeroSection.js';
import { PhotoGallery } from './components/PhotoGallery.js';
import { VideoSection } from './components/VideoSection.js';
import { MessageCards } from './components/MessageCards.js';
import { initializeScrollAnimations, refreshScrollTriggers } from './utils/scrollAnimations.js';
import { validateCloudConfiguration } from './utils/cloudinaryUtils.js';

class BirthdayApp {
  constructor() {
    this.components = {};
    this.siteData = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('🎉 Initializing Birthday Surprise Website...');

      // Show loading state
      this.showLoadingState();

      // Validate configuration
      this.validateConfiguration();

      // Load site data
      this.siteData = await loadSiteData();
      console.log('✅ Site data loaded successfully');

      // Render all components
      await this.renderComponents();

      // Initialize animations
      this.initializeAnimations();

      // Setup global event listeners
      this.setupEventListeners();

      // Hide loading state
      this.hideLoadingState();

      this.isInitialized = true;
      console.log('🎊 Birthday website initialized successfully!');

    } catch (error) {
      console.error('❌ Failed to initialize birthday website:', error);
      this.showErrorState(error);
    }
  }

  validateConfiguration() {
    // Check Cloudinary configuration
    const cloudConfigValid = validateCloudConfiguration();
    if (!cloudConfigValid) {
      console.warn('⚠️ Using default Cloudinary configuration');
    }

    // Check required DOM elements
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container element not found');
    }
  }

  showLoadingState() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
      <div class="app-loading">
        <div class="loading-spinner"></div>
        <p>Loading your special surprise...</p>
      </div>
    `;

    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
      .app-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        background: linear-gradient(135deg, #F8BBD9 0%, #E8B4CB 100%);
        color: white;
      }
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  hideLoadingState() {
    const loadingStyles = document.querySelector('style');
    if (loadingStyles && loadingStyles.textContent.includes('app-loading')) {
      loadingStyles.remove();
    }
  }

  async renderComponents() {
    const appContainer = document.getElementById('app');

    // Create main layout
    appContainer.innerHTML = `
      <main class="app-main">
        <div id="hero-container"></div>
        <div id="gallery-container"></div>
        <div id="video-container"></div>
        <div id="messages-container"></div>
      </main>
    `;

    // Render Hero Section
    console.log('🎨 Rendering hero section...');
    this.components.hero = new HeroSection(this.siteData.config);
    const heroContainer = document.getElementById('hero-container');
    this.components.hero.render(heroContainer);

    // Render Photo Gallery
    console.log('📸 Rendering photo gallery...');
    this.components.gallery = new PhotoGallery(this.siteData.photos);
    const galleryContainer = document.getElementById('gallery-container');
    this.components.gallery.render(galleryContainer);

    // Render Video Section
    console.log('🎬 Rendering video section...');
    this.components.video = new VideoSection(this.siteData.video);
    const videoContainer = document.getElementById('video-container');
    this.components.video.render(videoContainer);

    // Render Message Cards
    console.log('💌 Rendering message cards...');
    this.components.messages = new MessageCards(this.siteData.messages);
    const messagesContainer = document.getElementById('messages-container');
    this.components.messages.render(messagesContainer);

    console.log('✅ All components rendered');
  }

  async initializeAnimations() {
    console.log('✨ Initializing animations...');

    // Start hero animations
    if (this.components.hero) {
      await this.components.hero.startAnimations();
    }

    // Start gallery slideshow
    if (this.components.gallery) {
      this.components.gallery.startSlideshow();
    }

    // Initialize message cards scroll animations
    if (this.components.messages) {
      this.components.messages.initializeScrollAnimations();
    }

    // Initialize global scroll animations
    initializeScrollAnimations();

    console.log('✅ Animations initialized');
  }

  setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations when page is hidden
        if (this.components.gallery) {
          this.components.gallery.pauseSlideshow();
        }
      } else {
        // Resume animations when page becomes visible
        if (this.components.gallery) {
          this.components.gallery.startSlideshow();
        }
      }
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        refreshScrollTriggers();
      }, 100);
    });

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        refreshScrollTriggers();
      }, 250);
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          // Pause any playing content
          if (this.components.gallery) {
            this.components.gallery.pauseSlideshow();
          }
          break;
        case ' ':
          // Space bar to toggle slideshow (if not in a focusable element)
          if (!e.target.matches('button, input, textarea, select')) {
            e.preventDefault();
            if (this.components.gallery) {
              if (this.components.gallery.isPlaying) {
                this.components.gallery.pauseSlideshow();
              } else {
                this.components.gallery.startSlideshow();
              }
            }
          }
          break;
      }
    });

    // Error boundary for global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleGlobalError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleGlobalError(event.reason);
    });
  }

  handleGlobalError(error) {
    // Show user-friendly error message without breaking the site
    console.error('Handling global error:', error);

    // Create or update error notification
    let errorNotification = document.getElementById('error-notification');
    if (!errorNotification) {
      errorNotification = document.createElement('div');
      errorNotification.id = 'error-notification';
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        max-width: 300px;
        font-size: 14px;
      `;
      document.body.appendChild(errorNotification);
    }

    errorNotification.innerHTML = `
      <strong>Oops!</strong><br>
      Something went wrong, but don't worry - the magic continues! 🎉
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorNotification && errorNotification.parentNode) {
        errorNotification.parentNode.removeChild(errorNotification);
      }
    }, 5000);
  }

  showErrorState(error) {
    const appContainer = document.getElementById('app');
    const isValidationError = error instanceof ValidationError;

    const errorMessage = isValidationError
      ? 'There seems to be an issue with the content configuration.'
      : 'Something went wrong while loading the birthday surprise.';

    appContainer.innerHTML = `
      <div class="app-error">
        <h1>🎂</h1>
        <h2>Oops! Still working on the surprise...</h2>
        <p>${errorMessage}</p>
        <button onclick="window.location.reload()" class="retry-btn">
          Try Again 🔄
        </button>
        ${isValidationError ? `
          <details style="margin-top: 1rem; text-align: left;">
            <summary>Technical Details</summary>
            <pre style="white-space: pre-wrap; font-size: 12px; margin-top: 0.5rem;">${error.message}</pre>
          </details>
        ` : ''}
      </div>
    `;

    // Add error styles
    const style = document.createElement('style');
    style.textContent = `
      .app-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #F8BBD9 0%, #E8B4CB 100%);
        color: white;
      }
      .app-error h1 {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .app-error h2 {
        margin-bottom: 1rem;
      }
      .retry-btn {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border: none;
        padding: 1rem 2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
        transition: all 0.3s ease;
      }
      .retry-btn:hover {
        background: white;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
  }

  // Public API for external control
  pauseAll() {
    if (this.components.gallery) {
      this.components.gallery.pauseSlideshow();
    }
  }

  resumeAll() {
    if (this.components.gallery) {
      this.components.gallery.startSlideshow();
    }
  }

  destroy() {
    // Clean up all components
    Object.values(this.components).forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });

    this.components = {};
    this.isInitialized = false;
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new BirthdayApp();
  app.init();

  // Make app available globally for debugging
  window.birthdayApp = app;
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.birthdayApp) {
    window.birthdayApp.destroy();
  }
});