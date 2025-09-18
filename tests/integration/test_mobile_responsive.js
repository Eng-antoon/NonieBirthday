import { describe, it, expect, beforeEach, vi } from 'vitest'

// Integration tests for mobile responsiveness - These MUST fail initially (TDD)
describe('Mobile Responsiveness Integration Tests', () => {
  let mockSiteData

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>'

    mockSiteData = {
      config: {
        personalName: 'Marnona',
        heroMessage: 'Welcome to our beautiful journey together...',
        colorTheme: {
          primary: '#F8BBD9',
          secondary: '#FFF8E1',
          accent: '#E8B4CB'
        }
      },
      photos: [
        {
          id: 'photo-1',
          caption: 'Our first adventure',
          order: 1,
          altText: 'Couple outdoors'
        }
      ],
      video: {
        title: 'Special Message',
        videoUrl: 'https://example.com/video.mp4',
        duration: 120
      },
      messages: [
        {
          id: 'msg-1',
          messageText: 'You are amazing...',
          animationType: 'fade',
          scrollTrigger: 75,
          backgroundColor: '#F8BBD9',
          order: 1
        }
      ]
    }

    // Mock viewport changes
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    })

    // Mock touch events
    global.TouchEvent = class TouchEvent extends Event {
      constructor(type, options = {}) {
        super(type, options)
        this.touches = options.touches || []
        this.changedTouches = options.changedTouches || []
      }
    }
  })

  it('should adapt layout for mobile devices (320px+)', async () => {
    // This will fail until we implement responsive components
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    Object.defineProperty(window, 'innerHeight', { value: 667 })

    const heroSection = new HeroSection(mockSiteData.config)
    const container = document.getElementById('app')
    heroSection.render(container)

    const heroElement = container.querySelector('.hero-section')

    // Should apply mobile-specific styling
    expect(heroElement.classList.contains('mobile')).toBe(true)
    expect(window.getComputedStyle(heroElement).flexDirection).toBe('column')
  })

  it('should make touch interactions work smoothly', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    const slideshowContainer = container.querySelector('.slideshow-container')

    // Should support touch events
    expect(slideshowContainer.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function))
    expect(slideshowContainer.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function))
    expect(slideshowContainer.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function))
  })

  it('should ensure text remains readable at all sizes', async () => {
    const { MessageCards } = await import('../../src/components/MessageCards.js')

    // Test various mobile sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }  // iPhone 11
    ]

    for (const viewport of viewports) {
      Object.defineProperty(window, 'innerWidth', { value: viewport.width })
      Object.defineProperty(window, 'innerHeight', { value: viewport.height })

      const messageCards = new MessageCards(mockSiteData.messages)
      const container = document.createElement('div')
      messageCards.render(container)

      const card = container.querySelector('.message-card')
      const computedStyle = window.getComputedStyle(card)

      // Font size should be readable (minimum 14px on mobile)
      const fontSize = parseInt(computedStyle.fontSize)
      expect(fontSize).toBeGreaterThanOrEqual(14)

      // Line height should be comfortable
      const lineHeight = parseFloat(computedStyle.lineHeight)
      expect(lineHeight).toBeGreaterThanOrEqual(1.4)
    }
  })

  it('should scale images appropriately for mobile', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    const image = container.querySelector('img')

    // Should use mobile-optimized image dimensions
    expect(image.style.maxWidth).toBe('100%')
    expect(image.style.height).toBe('auto')
    expect(image.getAttribute('loading')).toBe('lazy')
  })

  it('should ensure navigation elements are touch-friendly (44px minimum)', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    const nextButton = container.querySelector('.slideshow-next')
    const prevButton = container.querySelector('.slideshow-prev')
    const dots = container.querySelectorAll('.slideshow-dot')

    // Touch target size should be at least 44px
    expect(parseInt(window.getComputedStyle(nextButton).minWidth)).toBeGreaterThanOrEqual(44)
    expect(parseInt(window.getComputedStyle(prevButton).minWidth)).toBeGreaterThanOrEqual(44)

    dots.forEach(dot => {
      expect(parseInt(window.getComputedStyle(dot).minWidth)).toBeGreaterThanOrEqual(44)
      expect(parseInt(window.getComputedStyle(dot).minHeight)).toBeGreaterThanOrEqual(44)
    })
  })

  it('should adapt video player for mobile viewing', async () => {
    const { VideoSection } = await import('../../src/components/VideoSection.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const videoSection = new VideoSection(mockSiteData.video)
    const container = document.getElementById('app')
    videoSection.render(container)

    const video = container.querySelector('video')
    const videoContainer = container.querySelector('.video-player')

    // Should be responsive
    expect(video.style.width).toBe('100%')
    expect(video.style.height).toBe('auto')

    // Should have mobile-friendly controls
    expect(video.controls).toBe(true)
    expect(videoContainer.classList.contains('mobile-optimized')).toBe(true)
  })

  it('should handle orientation changes gracefully', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    const heroSection = new HeroSection(mockSiteData.config)
    const container = document.getElementById('app')
    heroSection.render(container)

    // Simulate portrait
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    Object.defineProperty(window, 'innerHeight', { value: 667 })
    window.dispatchEvent(new Event('resize'))

    const heroPortrait = container.querySelector('.hero-section')
    expect(heroPortrait.classList.contains('portrait')).toBe(true)

    // Simulate landscape
    Object.defineProperty(window, 'innerWidth', { value: 667 })
    Object.defineProperty(window, 'innerHeight', { value: 375 })
    window.dispatchEvent(new Event('resize'))

    const heroLandscape = container.querySelector('.hero-section')
    expect(heroLandscape.classList.contains('landscape')).toBe(true)
  })

  it('should optimize performance for mobile devices', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    // Should implement lazy loading
    const images = container.querySelectorAll('img')
    images.forEach(img => {
      expect(img.getAttribute('loading')).toBe('lazy')
    })

    // Should use will-change for animations
    const slideshowContainer = container.querySelector('.slideshow-container')
    expect(slideshowContainer.style.willChange).toBe('transform')
  })

  it('should provide swipe gestures for gallery navigation', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    const slideshowContainer = container.querySelector('.slideshow-container')

    // Mock swipe gesture
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 100 }]
    })

    const touchMove = new TouchEvent('touchmove', {
      touches: [{ clientX: 100, clientY: 100 }]
    })

    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 }]
    })

    slideshowContainer.dispatchEvent(touchStart)
    slideshowContainer.dispatchEvent(touchMove)
    slideshowContainer.dispatchEvent(touchEnd)

    // Should detect swipe and navigate
    expect(gallery.currentSlide).toBe(1) // Should advance to next slide
  })

  it('should work in browser safe areas (notch support)', async () => {
    const { HeroSection } = await import('../../src/components/HeroSection.js')

    // Mock iPhone X/11 viewport with safe areas
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    Object.defineProperty(window, 'innerHeight', { value: 812 })

    // Mock CSS env() support for safe areas
    document.documentElement.style.setProperty('--safe-area-inset-top', '44px')
    document.documentElement.style.setProperty('--safe-area-inset-bottom', '34px')

    const heroSection = new HeroSection(mockSiteData.config)
    const container = document.getElementById('app')
    heroSection.render(container)

    const heroElement = container.querySelector('.hero-section')

    // Should respect safe areas
    expect(heroElement.style.paddingTop).toContain('env(safe-area-inset-top)')
    expect(heroElement.style.paddingBottom).toContain('env(safe-area-inset-bottom)')
  })

  it('should maintain aspect ratios on different screen sizes', async () => {
    const { VideoSection } = await import('../../src/components/VideoSection.js')

    const videoSection = new VideoSection(mockSiteData.video)
    const container = document.getElementById('app')
    videoSection.render(container)

    const videoContainer = container.querySelector('.video-player')

    // Should maintain 16:9 aspect ratio
    expect(videoContainer.style.aspectRatio).toBe('16 / 9')
  })

  it('should handle reduced motion on mobile', async () => {
    const { MessageCards } = await import('../../src/components/MessageCards.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    // Mock reduced motion preference on mobile
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

    const messageCards = new MessageCards(mockSiteData.messages)
    const container = document.getElementById('app')
    messageCards.render(container)

    messageCards.initializeScrollAnimations()

    // Should respect reduced motion even on mobile
    expect(messageCards.reducedMotion).toBe(true)
  })

  it('should provide accessible mobile navigation', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const gallery = new PhotoGallery(mockSiteData.photos)
    const container = document.getElementById('app')
    gallery.render(container)

    const nextButton = container.querySelector('.slideshow-next')
    const prevButton = container.querySelector('.slideshow-prev')

    // Should have proper ARIA labels for mobile screen readers
    expect(nextButton.getAttribute('aria-label')).toBe('Next photo')
    expect(prevButton.getAttribute('aria-label')).toBe('Previous photo')

    // Should have proper role and state
    expect(nextButton.getAttribute('role')).toBe('button')
    expect(nextButton.getAttribute('aria-disabled')).toBe('false')
  })
})