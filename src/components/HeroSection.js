/**
 * Hero Section Component
 * Displays personalized hero section with animated headline and message
 */

import { gsap } from 'gsap';

export class HeroSection {
  constructor(config) {
    this.config = config;
    this.animationComplete = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.timeline = null;
  }

  render(container) {
    // Create hero section HTML
    const heroHTML = `
      <section class="hero-section" role="banner">
        <div class="hero-content">
          <h1 class="hero-headline" aria-level="1">
            Happy Birthday, <span class="name-highlight">${this.config.personalName}</span>! 🎉
          </h1>
          <p class="hero-message">
            ${this.config.heroMessage}
          </p>
          <div class="hero-decoration">
            <div class="floating-heart">💕</div>
            <div class="floating-star">✨</div>
            <div class="floating-balloon">🎈</div>
          </div>
        </div>
        <div class="hero-background"></div>
      </section>
    `;

    container.innerHTML = heroHTML;

    // Apply color theme
    this.applyColorTheme(container);

    // Setup responsive classes
    this.setupResponsive(container);

    return container.querySelector('.hero-section');
  }

  applyColorTheme(container) {
    const heroElement = container.querySelector('.hero-section');

    // Set CSS custom properties for theme colors
    heroElement.style.setProperty('--primary-color', this.config.colorTheme.primary);
    heroElement.style.setProperty('--secondary-color', this.config.colorTheme.secondary);
    heroElement.style.setProperty('--accent-color', this.config.colorTheme.accent);
  }

  setupResponsive(container) {
    const heroElement = container.querySelector('.hero-section');

    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Remove existing classes
      heroElement.classList.remove('mobile', 'tablet', 'desktop', 'portrait', 'landscape');

      // Add device classes
      if (width <= 480) {
        heroElement.classList.add('mobile');
      } else if (width <= 768) {
        heroElement.classList.add('tablet');
      } else {
        heroElement.classList.add('desktop');
      }

      // Add orientation classes
      if (height > width) {
        heroElement.classList.add('portrait');
      } else {
        heroElement.classList.add('landscape');
      }
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);
  }

  async startAnimations() {
    if (this.reducedMotion) {
      // Skip animations for reduced motion preference
      this.animationComplete = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const headline = document.querySelector('.hero-headline');
      const message = document.querySelector('.hero-message');
      const decorations = document.querySelectorAll('.hero-decoration > div');

      // Create GSAP timeline
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.animationComplete = true;
          resolve();
        }
      });

      // Set initial states
      gsap.set([headline, message, ...decorations], {
        opacity: 0,
        y: 50
      });

      // Animate headline first
      this.timeline.to(headline, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out'
      });

      // Animate message after slight delay
      this.timeline.to(message, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.5');

      // Animate decorations with stagger
      this.timeline.to(decorations, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'bounce.out'
      }, '-=0.3');

      // Add floating animation for decorations
      this.timeline.to(decorations, {
        y: '+=10',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.3
      });
    });
  }

  destroy() {
    if (this.timeline) {
      this.timeline.kill();
    }
  }
}