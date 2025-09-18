/**
 * Message Cards Component
 * Scroll-triggered animated message cards with various animation types
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export class MessageCards {
  constructor(messages) {
    this.messages = messages.sort((a, b) => a.order - b.order);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.intersectionObserver = null;
    this.scrollTriggers = [];
  }

  render(container) {
    const cardsHTML = `
      <section class="message-cards">
        <div class="cards-container">
          ${this.messages.map((message, index) => this.createCardHTML(message, index)).join('')}
        </div>
      </section>
    `;

    container.innerHTML = cardsHTML;
    this.setupResponsive(container);

    return container.querySelector('.message-cards');
  }

  createCardHTML(message, index) {
    return `
      <div class="message-card ${this.getResponsiveClass()}"
           data-animation-type="${message.animationType}"
           data-scroll-trigger="${message.scrollTrigger}"
           data-order="${message.order}"
           style="background-color: ${message.backgroundColor};">
        <div class="card-content">
          <p class="message-text">${this.formatMessageText(message.messageText)}</p>
        </div>
        <div class="card-decoration">
          ${this.getDecorationForOrder(message.order)}
        </div>
      </div>
    `;
  }

  formatMessageText(text) {
    // Handle long text gracefully
    if (text.length > 300) {
      return text.substring(0, 297) + '...';
    }
    return text;
  }

  getDecorationForOrder(order) {
    const decorations = ['💝', '✨', '🌸', '💕', '🎈'];
    return decorations[(order - 1) % decorations.length];
  }

  getResponsiveClass() {
    const width = window.innerWidth;
    if (width <= 480) return 'mobile-responsive';
    if (width <= 768) return 'tablet-responsive';
    return 'desktop-responsive';
  }

  setupResponsive(container) {
    const updateResponsive = () => {
      const cards = container.querySelectorAll('.message-card');
      cards.forEach(card => {
        card.className = card.className.replace(/\b(mobile|tablet|desktop)-responsive\b/g, '');
        card.classList.add(this.getResponsiveClass());
      });
    };

    window.addEventListener('resize', updateResponsive);
  }

  initializeScrollAnimations() {
    if (this.reducedMotion) {
      // Show all cards immediately for reduced motion
      const cards = document.querySelectorAll('.message-card');
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return;
    }

    // Setup intersection observer for performance
    this.setupIntersectionObserver();

    // Create scroll triggers for each card
    this.messages.forEach((message, index) => {
      this.createScrollTrigger(message, index);
    });
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const card = entry.target;
            const animationType = card.dataset.animationType;
            this.animateCard(card, animationType);
          }
        });
      },
      {
        threshold: [0.3, 0.7],
        rootMargin: '10px'
      }
    );

    // Observe all cards
    const cards = document.querySelectorAll('.message-card');
    cards.forEach(card => {
      this.intersectionObserver.observe(card);
    });
  }

  createScrollTrigger(message, index) {
    const card = document.querySelector(`[data-order="${message.order}"]`);
    if (!card) return;

    // Set initial state
    gsap.set(card, this.getInitialState(message.animationType));

    const scrollTrigger = ScrollTrigger.create({
      trigger: card,
      start: `top ${message.scrollTrigger}%`,
      end: 'bottom 20%',
      onEnter: () => {
        this.animateCard(card, message.animationType);
      },
      onLeave: () => {
        // Optional: animate out
      },
      onEnterBack: () => {
        // Re-animate if scrolling back up
        this.animateCard(card, message.animationType);
      }
    });

    this.scrollTriggers.push(scrollTrigger);
  }

  getInitialState(animationType) {
    switch (animationType) {
      case 'fade':
        return { opacity: 0 };

      case 'flip':
        return { opacity: 0, rotationY: 90 };

      case 'slide':
        return { opacity: 0, x: 100 };

      case 'bounce':
        return { opacity: 0, y: 50, scale: 0.5 };

      default:
        return { opacity: 0 };
    }
  }

  animateCard(card, animationType) {
    const order = parseInt(card.dataset.order);
    const delay = (order - 1) * 0.2; // 200ms stagger

    const baseConfig = {
      duration: 0.8,
      delay: delay,
      ease: 'power2.out'
    };

    switch (animationType) {
      case 'fade':
        gsap.fromTo(card,
          { opacity: 0 },
          { ...baseConfig, opacity: 1 }
        );
        break;

      case 'flip':
        gsap.fromTo(card,
          { opacity: 0, rotationY: 90 },
          { ...baseConfig, opacity: 1, rotationY: 0 }
        );
        break;

      case 'slide':
        gsap.fromTo(card,
          { opacity: 0, x: 100 },
          { ...baseConfig, opacity: 1, x: 0 }
        );
        break;

      case 'bounce':
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.5 },
          { ...baseConfig, opacity: 1, y: 0, scale: 1, ease: 'bounce.out' }
        );
        break;

      default:
        gsap.to(card, { ...baseConfig, opacity: 1 });
    }
  }

  // Public API
  get isAutoAdvancing() {
    return !this.reducedMotion;
  }

  destroy() {
    // Clean up scroll triggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];

    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Kill all ScrollTrigger instances
    ScrollTrigger.killAll();
  }
}