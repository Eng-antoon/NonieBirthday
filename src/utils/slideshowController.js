/**
 * Slideshow Controller
 * Advanced slideshow controller with GSAP animations and full functionality
 */

import { gsap } from 'gsap';

export function createSlideshow(photos) {
  if (!photos || photos.length === 0) {
    throw new Error('Photos array is required and must not be empty');
  }

  let currentSlide = 0;
  let isPlaying = false;
  let autoAdvanceTimer = null;
  let isDestroyed = false;

  const controller = {
    // Properties
    get currentSlide() {
      return currentSlide;
    },

    get isPlaying() {
      return isPlaying;
    },

    get isAutoAdvancing() {
      return isPlaying && autoAdvanceTimer !== null;
    },

    // Core navigation methods
    play() {
      if (isDestroyed) {
        throw new Error('Slideshow has been destroyed');
      }

      if (isPlaying) return;

      isPlaying = true;
      autoAdvanceTimer = setInterval(() => {
        this.nextSlide();
      }, 5000); // 5-second intervals
    },

    pause() {
      isPlaying = false;
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    },

    goToSlide(index) {
      if (isDestroyed) {
        throw new Error('Slideshow has been destroyed');
      }

      // Clamp index to valid range
      if (index < 0) {
        index = 0;
      } else if (index >= photos.length) {
        index = photos.length - 1;
      }

      if (index === currentSlide) return;

      const previousSlide = currentSlide;
      currentSlide = index;

      // Trigger slide change animation
      this._animateSlideChange(previousSlide, currentSlide);
    },

    nextSlide() {
      const nextIndex = (currentSlide + 1) % photos.length;
      this.goToSlide(nextIndex);
    },

    previousSlide() {
      const prevIndex = currentSlide === 0 ? photos.length - 1 : currentSlide - 1;
      this.goToSlide(prevIndex);
    },

    // Touch/swipe handlers
    handleSwipeLeft() {
      this.nextSlide();
    },

    handleSwipeRight() {
      this.previousSlide();
    },

    // Hover pause functionality
    pauseOnHover(shouldPause) {
      if (shouldPause && isPlaying) {
        this.pause();
        this._wasPlayingBeforeHover = true;
      } else if (!shouldPause && this._wasPlayingBeforeHover) {
        this.play();
        this._wasPlayingBeforeHover = false;
      }
    },

    // Internal animation method
    _animateSlideChange(fromIndex, toIndex) {
      const slides = document.querySelectorAll('.photo-slide');
      const fromSlide = slides[fromIndex];
      const toSlide = slides[toIndex];

      if (!fromSlide || !toSlide) return;

      // Create animation timeline
      const timeline = gsap.timeline();

      // Fade out current slide
      timeline.to(fromSlide, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      });

      // Update active class
      timeline.call(() => {
        slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === toIndex);
        });
      });

      // Fade in new slide
      timeline.to(toSlide, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut'
      }, '-=0.2'); // Overlap slightly

      // Animate Ken Burns effect on new slide
      const newImage = toSlide.querySelector('img');
      if (newImage) {
        timeline.fromTo(newImage, {
          scale: 1.1,
          transformOrigin: 'center center'
        }, {
          scale: 1.05,
          duration: 5,
          ease: 'power1.inOut'
        }, '-=0.4');
      }

      // Trigger caption update
      timeline.call(() => {
        this._updateCaption(toIndex);
      });
    },

    _updateCaption(slideIndex) {
      const captionElement = document.querySelector('.caption-text');
      if (!captionElement) return;

      const photo = photos[slideIndex];
      if (!photo) return;

      // Animate caption change
      gsap.to(captionElement, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          captionElement.textContent = photo.caption;
          gsap.to(captionElement, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
    },

    // Cleanup method
    destroy() {
      this.pause();
      isDestroyed = true;

      // Clear any remaining timers
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }

      // Kill any active GSAP animations
      gsap.killTweensOf('*');
    }
  };

  // Initialize with first slide
  controller._updateCaption(0);

  return controller;
}