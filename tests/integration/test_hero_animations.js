import { describe, it, expect, beforeEach, vi } from 'vitest'

// Integration tests for hero section animations - These MUST fail initially (TDD)
describe('Hero Section Animation Integration Tests', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>'

    // Mock GSAP
    global.gsap = {
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        play: vi.fn(),
        pause: vi.fn(),
        kill: vi.fn()
      })),
      to: vi.fn(),
      from: vi.fn(),
      fromTo: vi.fn(),
      set: vi.fn()
    }
  })

  it('should initialize hero section with correct elements', async () => {
    // This will fail until we implement HeroSection component
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey together...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    // Should create hero elements
    expect(container.querySelector('.hero-section')).toBeTruthy()
    expect(container.querySelector('.hero-headline')).toBeTruthy()
    expect(container.querySelector('.hero-message')).toBeTruthy()
  })

  it('should display correct personalized content', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const siteConfig = {
      personalName: 'Nonie',
      heroMessage: 'Happy Birthday, beautiful!',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    const headline = container.querySelector('.hero-headline')
    const message = container.querySelector('.hero-message')

    expect(headline.textContent).toContain('Nonie')
    expect(message.textContent).toContain('Happy Birthday, beautiful!')
  })

  it('should start animation sequence on load', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey together...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    // Should initialize animations
    await heroSection.startAnimations()

    // Verify GSAP timeline was created and used
    expect(global.gsap.timeline).toHaveBeenCalled()
  })

  it('should animate headline first, then message', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const mockTimeline = {
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      play: vi.fn(),
      pause: vi.fn()
    }

    global.gsap.timeline.mockReturnValue(mockTimeline)

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    await heroSection.startAnimations()

    // Should animate headline and message in sequence
    expect(mockTimeline.to).toHaveBeenCalled()
    expect(mockTimeline.to.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('should complete animation within 2 seconds total duration', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    vi.useFakeTimers()

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    const animationPromise = heroSection.startAnimations()

    // Fast-forward 2 seconds
    vi.advanceTimersByTime(2000)

    await animationPromise

    // Animation should be complete
    expect(heroSection.animationComplete).toBe(true)

    vi.useRealTimers()
  })

  it('should apply color theme to elements', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    const heroElement = container.querySelector('.hero-section')
    const computedStyle = window.getComputedStyle(heroElement)

    // Should apply theme colors (exact implementation may vary)
    expect(heroElement.style.getPropertyValue('--primary-color')).toBe('#F8BBD9')
    expect(heroElement.style.getPropertyValue('--secondary-color')).toBe('#FFF8E1')
    expect(heroElement.style.getPropertyValue('--accent-color')).toBe('#E8B4CB')
  })

  it('should be accessible with proper ARIA labels', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    const heroElement = container.querySelector('.hero-section')
    const headline = container.querySelector('.hero-headline')

    expect(heroElement.getAttribute('role')).toBe('banner')
    expect(headline.getAttribute('aria-level')).toBe('1')
  })

  it('should respect prefers-reduced-motion setting', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const siteConfig = {
      personalName: 'Marnona',
      heroMessage: 'Welcome to our beautiful journey...',
      colorTheme: {
        primary: '#F8BBD9',
        secondary: '#FFF8E1',
        accent: '#E8B4CB'
      }
    }

    const heroSection = new HeroSection(siteConfig)
    const container = document.getElementById('app')
    heroSection.render(container)

    await heroSection.startAnimations()

    // Should skip or reduce animations
    expect(heroSection.reducedMotion).toBe(true)
  })
})