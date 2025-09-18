/**
 * Scroll Animations Setup
 * Initializes and manages GSAP ScrollTrigger animations for the site
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

let isInitialized = false;
let reducedMotion = false;

/**
 * Initialize scroll trigger animations for the entire site
 */
export function initializeScrollAnimations() {
  if (isInitialized) {
    console.warn('Scroll animations already initialized');
    return;
  }

  // Check for reduced motion preference
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    console.log('Reduced motion detected, skipping scroll animations');
    return;
  }

  // Initialize different animation sets
  setupHeroAnimations();
  setupSectionAnimations();
  setupParallaxEffects();
  setupRevealAnimations();

  // Refresh ScrollTrigger after setup
  ScrollTrigger.refresh();

  isInitialized = true;
  console.log('Scroll animations initialized');
}

/**
 * Setup hero section entrance animations
 */
function setupHeroAnimations() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  const headline = heroSection.querySelector('.hero-headline');
  const message = heroSection.querySelector('.hero-message');
  const decorations = heroSection.querySelectorAll('.hero-decoration > div');

  // Set initial states
  gsap.set([headline, message, ...decorations], {
    opacity: 0,
    y: 50
  });

  // Create entrance timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  tl.to(headline, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out'
  })
  .to(message, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.5')
  .to(decorations, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.2,
    ease: 'bounce.out'
  }, '-=0.3');
}

/**
 * Setup section-by-section reveal animations
 */
function setupSectionAnimations() {
  const sections = document.querySelectorAll('.photo-gallery, .video-section');

  sections.forEach(section => {
    gsap.fromTo(section, {
      opacity: 0,
      y: 80
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/**
 * Setup parallax scrolling effects
 */
function setupParallaxEffects() {
  // Hero background parallax
  const heroBackground = document.querySelector('.hero-background');
  if (heroBackground) {
    gsap.to(heroBackground, {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroBackground,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Floating decorations parallax
  const floatingElements = document.querySelectorAll('.floating-heart, .floating-star, .floating-balloon');
  floatingElements.forEach((element, index) => {
    const speed = 0.5 + (index * 0.2); // Different speeds for layered effect

    gsap.to(element, {
      y: `+=${100 * speed}`,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/**
 * Setup reveal animations for various elements
 */
function setupRevealAnimations() {
  // Gallery controls fade in
  const galleryControls = document.querySelectorAll('.slideshow-controls, .slideshow-dots');
  galleryControls.forEach(control => {
    gsap.fromTo(control, {
      opacity: 0,
      scale: 0.8
    }, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: control,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Video player reveal
  const videoPlayer = document.querySelector('.video-player');
  if (videoPlayer) {
    gsap.fromTo(videoPlayer, {
      opacity: 0,
      scale: 0.9,
      rotationX: 15
    }, {
      opacity: 1,
      scale: 1,
      rotationX: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: videoPlayer,
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Caption animations
  const captions = document.querySelectorAll('.slideshow-caption, .video-title');
  captions.forEach(caption => {
    gsap.fromTo(caption, {
      opacity: 0,
      y: 30
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: caption,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/**
 * Add scroll-triggered animation to a specific element
 * @param {Element} element - Target element
 * @param {Object} fromVars - Initial animation state
 * @param {Object} toVars - Final animation state
 * @param {Object} scrollTriggerConfig - ScrollTrigger configuration
 */
export function addScrollAnimation(element, fromVars, toVars, scrollTriggerConfig = {}) {
  if (reducedMotion) return;

  const defaultConfig = {
    trigger: element,
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  };

  gsap.fromTo(element, fromVars, {
    ...toVars,
    scrollTrigger: { ...defaultConfig, ...scrollTriggerConfig }
  });
}

/**
 * Create a scroll-triggered timeline animation
 * @param {Object} config - Timeline configuration
 * @returns {gsap.Timeline} GSAP timeline
 */
export function createScrollTimeline(config = {}) {
  if (reducedMotion) {
    return gsap.timeline(); // Return empty timeline
  }

  const defaultScrollTrigger = {
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  };

  return gsap.timeline({
    scrollTrigger: { ...defaultScrollTrigger, ...config.scrollTrigger }
  });
}

/**
 * Refresh all ScrollTrigger instances
 */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

/**
 * Kill all scroll animations and clean up
 */
export function destroyScrollAnimations() {
  ScrollTrigger.killAll();
  gsap.killTweensOf('*');
  isInitialized = false;
  console.log('Scroll animations destroyed');
}

/**
 * Temporarily disable scroll animations
 */
export function disableScrollAnimations() {
  ScrollTrigger.disable();
}

/**
 * Re-enable scroll animations
 */
export function enableScrollAnimations() {
  if (!reducedMotion) {
    ScrollTrigger.enable();
  }
}

/**
 * Check if animations are enabled
 * @returns {boolean} True if animations are enabled
 */
export function areAnimationsEnabled() {
  return !reducedMotion && isInitialized;
}

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