/**
 * Photo Gallery Component
 * Interactive slideshow with auto-advance, manual controls, and touch support
 */

import { gsap } from 'gsap';
import { generateCloudinaryUrl, getDeviceOptimizedOptions } from '../utils/cloudinaryUtils.js';

export class PhotoGallery {
  constructor(photos) {
    this.photos = photos.sort((a, b) => a.order - b.order);
    this.currentSlide = 0;
    this.isPlaying = false;
    this.autoAdvanceTimer = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  render(container) {
    const galleryHTML = `
      <section class="photo-gallery">
        <div class="slideshow-container" tabindex="0" role="region" aria-label="Photo slideshow">
          <div class="slides-wrapper">
            ${this.photos.map((photo, index) => this.createSlideHTML(photo, index)).join('')}
          </div>

          <div class="slideshow-controls">
            <button class="slideshow-prev" aria-label="Previous photo" role="button">
              <span aria-hidden="true">‹</span>
            </button>
            <button class="slideshow-next" aria-label="Next photo" role="button">
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div class="slideshow-dots">
            ${this.photos.map((_, index) =>
              `<button class="slideshow-dot ${index === 0 ? 'active' : ''}"
                       aria-label="Go to slide ${index + 1}"
                       data-slide="${index}"></button>`
            ).join('')}
          </div>

          <div class="slideshow-caption">
            <p class="caption-text">${this.photos[0]?.caption || ''}</p>
          </div>
        </div>
      </section>
    `;

    container.innerHTML = galleryHTML;
    this.setupEventListeners(container);
    this.updateSlideVisibility();

    return container.querySelector('.photo-gallery');
  }

  createSlideHTML(photo, index) {
    const deviceOptions = getDeviceOptimizedOptions();
    const imageUrl = generateCloudinaryUrl(photo.id, deviceOptions);
    const thumbnailUrl = generateCloudinaryUrl(photo.id, { width: 50, height: 50, crop: 'thumb' });

    return `
      <div class="photo-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
        <img
          src="${imageUrl}"
          alt="${photo.altText}"
          class="slide-image ken-burns"
          loading="${index === 0 ? 'eager' : 'lazy'}"
          data-thumbnail="${thumbnailUrl}"
        />
        <div class="image-overlay"></div>
      </div>
    `;
  }

  setupEventListeners(container) {
    const slideshowContainer = container.querySelector('.slideshow-container');
    const nextButton = container.querySelector('.slideshow-next');
    const prevButton = container.querySelector('.slideshow-prev');
    const dots = container.querySelectorAll('.slideshow-dot');

    // Navigation buttons
    nextButton.addEventListener('click', () => this.nextSlide());
    prevButton.addEventListener('click', () => this.previousSlide());

    // Dot navigation
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const slideIndex = parseInt(e.target.dataset.slide);
        this.goToSlide(slideIndex);
      });
    });

    // Keyboard navigation
    slideshowContainer.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case ' ':
          e.preventDefault();
          this.isPlaying ? this.pauseSlideshow() : this.startSlideshow();
          break;
      }
    });

    // Touch/swipe support
    this.setupTouchEvents(slideshowContainer);

    // Hover pause/resume
    slideshowContainer.addEventListener('mouseenter', () => this.pauseOnHover(true));
    slideshowContainer.addEventListener('mouseleave', () => this.pauseOnHover(false));

    // Image error handling
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('error', (e) => this.handleImageError(e.target));
    });
  }

  setupTouchEvents(container) {
    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!this.touchStartX || !this.touchStartY) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = this.touchStartX - touchEndX;
      const diffY = this.touchStartY - touchEndY;

      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.handleSwipeLeft();
        } else {
          this.handleSwipeRight();
        }
      }

      this.touchStartX = 0;
      this.touchStartY = 0;
    }, { passive: true });
  }

  handleSwipeLeft() {
    this.nextSlide();
  }

  handleSwipeRight() {
    this.previousSlide();
  }

  goToSlide(index) {
    if (index < 0 || index >= this.photos.length) return;

    const oldSlide = this.currentSlide;
    this.currentSlide = index;

    this.updateSlideVisibility();
    this.updateDots();
    this.updateCaption();
    this.animateSlideTransition(oldSlide, index);
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.photos.length;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = this.currentSlide === 0 ? this.photos.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  updateSlideVisibility() {
    const slides = document.querySelectorAll('.photo-slide');
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentSlide);
    });
  }

  updateDots() {
    const dots = document.querySelectorAll('.slideshow-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
      dot.setAttribute('aria-disabled', index === this.currentSlide ? 'true' : 'false');
    });
  }

  updateCaption() {
    const captionElement = document.querySelector('.caption-text');
    if (captionElement) {
      const currentPhoto = this.photos[this.currentSlide];

      // Animate caption change
      gsap.to(captionElement, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          captionElement.textContent = currentPhoto.caption;
          gsap.to(captionElement, {
            opacity: 1,
            duration: 0.3
          });
        }
      });
    }
  }

  animateSlideTransition(oldIndex, newIndex) {
    const slides = document.querySelectorAll('.photo-slide');
    const oldSlide = slides[oldIndex];
    const newSlide = slides[newIndex];

    // Cross-fade transition
    gsap.fromTo(newSlide,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.inOut' }
    );

    if (oldSlide) {
      gsap.to(oldSlide, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    }
  }

  startSlideshow() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.autoAdvanceTimer = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 second intervals
  }

  pauseSlideshow() {
    this.isPlaying = false;
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  pauseOnHover(shouldPause) {
    if (shouldPause && this.isPlaying) {
      this.pauseSlideshow();
      this._wasPlayingBeforeHover = true;
    } else if (!shouldPause && this._wasPlayingBeforeHover) {
      this.startSlideshow();
      this._wasPlayingBeforeHover = false;
    }
  }

  handleImageError(img) {
    img.classList.add('error');
    img.alt = 'Image failed to load';

    // Create a placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = '📷<br>Image not available';

    img.parentNode.appendChild(placeholder);
    img.style.display = 'none';
  }

  destroy() {
    this.pauseSlideshow();
    // Remove event listeners would go here in a full implementation
  }
}