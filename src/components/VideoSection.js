/**
 * Video Section Component
 * Responsive video player with accessibility and error handling
 */

import { getVideoEmbedUrl, createVideoElement, setupVideoHandlers, generateVideoPoster } from '../utils/videoUtils.js';

export class VideoSection {
  constructor(videoData) {
    this.videoData = videoData;
    this.videoElement = null;
    this.isLoading = true;
    this.hasError = false;
  }

  render(container) {
    const videoHTML = `
      <section class="video-section">
        <div class="video-content">
          <h2 class="video-title">${this.videoData.title}</h2>

          <div class="video-player responsive" role="application">
            <div class="loading-indicator">
              <div class="spinner"></div>
              <p>Loading video...</p>
            </div>

            <div class="video-error" style="display: none;">
              <div class="error-icon">⚠️</div>
              <p>Sorry, the video is unable to load right now.</p>
              <button class="retry-button">Try Again</button>
            </div>

            <div class="video-container">
              <!-- Video element will be inserted here -->
            </div>

            <div class="video-info">
              <span class="video-duration">${this.formatDuration(this.videoData.duration)}</span>
            </div>
          </div>
        </div>
      </section>
    `;

    container.innerHTML = videoHTML;
    this.setupVideo(container);
    this.setupEventListeners(container);

    return container.querySelector('.video-section');
  }

  setupVideo(container) {
    try {
      // Create video element with optimal settings
      const videoOptions = {
        controls: true,
        preload: 'metadata',
        playsinline: true,
        title: this.videoData.title,
        muted: false,
        autoplay: false
      };

      // Respect reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        videoOptions.autoplay = false;
      }

      this.videoElement = createVideoElement(this.videoData.videoUrl, videoOptions);

      // Set poster image if available
      if (this.videoData.thumbnailId) {
        const posterUrl = generateVideoPoster(this.videoData.thumbnailId);
        if (posterUrl) {
          this.videoElement.poster = posterUrl;
        }
      }

      // Add video to container
      const videoContainer = container.querySelector('.video-container');
      videoContainer.appendChild(this.videoElement);

      // Setup video event handlers
      this.setupVideoEventHandlers(container);

    } catch (error) {
      console.error('Failed to setup video:', error);
      this.showError(container, error.message);
    }
  }

  setupVideoEventHandlers(container) {
    const loadingIndicator = container.querySelector('.loading-indicator');
    const errorElement = container.querySelector('.video-error');

    setupVideoHandlers(this.videoElement, {
      onLoadStart: () => {
        this.isLoading = true;
        loadingIndicator.style.display = 'block';
        errorElement.style.display = 'none';
      },

      onLoadedData: () => {
        this.isLoading = false;
        loadingIndicator.style.display = 'none';
        this.videoElement.style.display = 'block';
      },

      onError: (error, event) => {
        console.error('Video error:', error);
        this.showError(container, error.message || 'Video playback error');
      },

      onPlay: () => {
        this.onVideoEvent('play');
      },

      onPause: () => {
        this.onVideoEvent('pause');
      },

      onEnded: () => {
        this.onVideoEvent('ended');
      }
    });
  }

  setupEventListeners(container) {
    const retryButton = container.querySelector('.retry-button');

    retryButton.addEventListener('click', () => {
      this.retryVideoLoad(container);
    });

    // Keyboard accessibility for video container
    const videoPlayer = container.querySelector('.video-player');
    videoPlayer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.videoElement.paused) {
          this.videoElement.play().catch(err => {
            console.warn('Auto-play prevented:', err);
          });
        } else {
          this.videoElement.pause();
        }
      }
    });
  }

  showError(container, message) {
    this.hasError = true;
    this.isLoading = false;

    const loadingIndicator = container.querySelector('.loading-indicator');
    const errorElement = container.querySelector('.video-error');
    const errorMessage = errorElement.querySelector('p');

    loadingIndicator.style.display = 'none';
    errorElement.style.display = 'block';
    errorMessage.textContent = message || 'Sorry, the video is unable to load right now.';

    if (this.videoElement) {
      this.videoElement.style.display = 'none';
    }
  }

  retryVideoLoad(container) {
    this.hasError = false;

    const errorElement = container.querySelector('.video-error');
    const loadingIndicator = container.querySelector('.loading-indicator');

    errorElement.style.display = 'none';
    loadingIndicator.style.display = 'block';

    if (this.videoElement) {
      this.videoElement.load();
    } else {
      // Recreate video element
      this.setupVideo(container);
    }
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onVideoEvent(eventType) {
    // Analytics or tracking could be implemented here
    console.log(`Video event: ${eventType}`);

    // Dispatch custom events for external listeners
    const customEvent = new CustomEvent('video-event', {
      detail: {
        type: eventType,
        currentTime: this.videoElement.currentTime,
        duration: this.videoElement.duration
      }
    });

    document.dispatchEvent(customEvent);
  }

  // Public API methods
  play() {
    if (this.videoElement && !this.hasError) {
      return this.videoElement.play();
    }
    return Promise.reject(new Error('Video not available'));
  }

  pause() {
    if (this.videoElement && !this.hasError) {
      this.videoElement.pause();
    }
  }

  seek(time) {
    if (this.videoElement && !this.hasError) {
      this.videoElement.currentTime = time;
    }
  }

  setVolume(level) {
    if (this.videoElement && !this.hasError) {
      this.videoElement.volume = Math.max(0, Math.min(1, level));
    }
  }

  destroy() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.load();
    }
  }
}