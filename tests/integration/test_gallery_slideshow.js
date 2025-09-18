import { describe, it, expect, beforeEach, vi } from 'vitest'

// Integration tests for gallery slideshow - These MUST fail initially (TDD)
describe('Gallery Slideshow Integration Tests', () => {
  let mockPhotos

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>'

    mockPhotos = [
      {
        id: 'photo-1',
        caption: 'Our first adventure together',
        order: 1,
        altText: 'Tony and Marnona smiling together outdoors'
      },
      {
        id: 'photo-2',
        caption: 'That perfect sunset moment',
        order: 2,
        altText: 'Couple watching sunset by the water'
      },
      {
        id: 'photo-3',
        caption: 'Dancing in the kitchen',
        order: 3,
        altText: 'Couple dancing together in kitchen'
      }
    ]

    // Mock GSAP
    global.gsap = {
      to: vi.fn(),
      from: vi.fn(),
      fromTo: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        play: vi.fn(),
        pause: vi.fn()
      }))
    }

    // Mock cloudinary utils
    vi.doMock('../../src/utils/cloudinaryUtils.js', () => ({
      generateCloudinaryUrl: vi.fn((id, options) => `https://res.cloudinary.com/test-cloud/image/upload/${id}`)
    }))
  })

  it('should initialize gallery with photo slides', async () => {
    // This will fail until we implement PhotoGallery component
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    // Should create gallery structure
    expect(container.querySelector('.photo-gallery')).toBeTruthy()
    expect(container.querySelector('.slideshow-container')).toBeTruthy()
    expect(container.querySelectorAll('.photo-slide')).toHaveLength(mockPhotos.length)
  })

  it('should display first photo immediately on load', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const firstSlide = container.querySelector('.photo-slide.active')
    const firstImage = firstSlide.querySelector('img')
    const firstCaption = firstSlide.querySelector('.photo-caption')

    expect(firstSlide).toBeTruthy()
    expect(firstImage.src).toContain('photo-1')
    expect(firstCaption.textContent).toBe('Our first adventure together')
    expect(firstImage.alt).toBe('Tony and Marnona smiling together outdoors')
  })

  it('should auto-advance every 5 seconds', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    vi.useFakeTimers()

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    // Start slideshow
    gallery.startSlideshow()

    // Initially on first slide
    expect(gallery.currentSlide).toBe(0)

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000)

    // Should advance to second slide
    expect(gallery.currentSlide).toBe(1)

    // Advance another 5 seconds
    vi.advanceTimersByTime(5000)

    // Should advance to third slide
    expect(gallery.currentSlide).toBe(2)

    vi.useRealTimers()
  })

  it('should loop back to first photo after last', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    vi.useFakeTimers()

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    gallery.startSlideshow()

    // Go to last slide
    gallery.goToSlide(2)
    expect(gallery.currentSlide).toBe(2)

    // Auto-advance
    vi.advanceTimersByTime(5000)

    // Should loop back to first
    expect(gallery.currentSlide).toBe(0)

    vi.useRealTimers()
  })

  it('should provide manual navigation controls', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const nextButton = container.querySelector('.slideshow-next')
    const prevButton = container.querySelector('.slideshow-prev')
    const dots = container.querySelectorAll('.slideshow-dot')

    expect(nextButton).toBeTruthy()
    expect(prevButton).toBeTruthy()
    expect(dots).toHaveLength(mockPhotos.length)

    // Test next button
    nextButton.click()
    expect(gallery.currentSlide).toBe(1)

    // Test previous button
    prevButton.click()
    expect(gallery.currentSlide).toBe(0)

    // Test dot navigation
    dots[2].click()
    expect(gallery.currentSlide).toBe(2)
  })

  it('should animate captions smoothly with slide transitions', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const nextButton = container.querySelector('.slideshow-next')

    // Mock GSAP calls
    const gsapToSpy = vi.spyOn(global.gsap, 'to')

    nextButton.click()

    // Should animate both image and caption
    expect(gsapToSpy).toHaveBeenCalledWith(
      expect.any(Element),
      expect.objectContaining({
        duration: expect.any(Number)
      })
    )
  })

  it('should support touch swipe on mobile devices', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const slideshowContainer = container.querySelector('.slideshow-container')

    // Mock touch events
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 }]
    })

    // Swipe right (should go to previous)
    slideshowContainer.dispatchEvent(touchStart)
    slideshowContainer.dispatchEvent(touchEnd)

    // Should handle swipe
    expect(gallery.currentSlide).toBe(mockPhotos.length - 1) // Should wrap to last slide
  })

  it('should pause on hover and resume on mouse leave', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const slideshowContainer = container.querySelector('.slideshow-container')

    gallery.startSlideshow()
    expect(gallery.isPlaying).toBe(true)

    // Hover
    const mouseEnter = new Event('mouseenter')
    slideshowContainer.dispatchEvent(mouseEnter)
    expect(gallery.isPlaying).toBe(false)

    // Mouse leave
    const mouseLeave = new Event('mouseleave')
    slideshowContainer.dispatchEvent(mouseLeave)
    expect(gallery.isPlaying).toBe(true)
  })

  it('should apply Ken Burns effect to images', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const firstImage = container.querySelector('.photo-slide img')

    // Ken Burns effect should be applied via CSS class or inline styles
    expect(firstImage.classList.contains('ken-burns')).toBe(true)
  })

  it('should generate responsive Cloudinary URLs', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')
    const { generateCloudinaryUrl } = await import('../../src/utils/cloudinaryUtils.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    // Should call generateCloudinaryUrl for each photo
    expect(generateCloudinaryUrl).toHaveBeenCalledWith('photo-1', expect.any(Object))
    expect(generateCloudinaryUrl).toHaveBeenCalledWith('photo-2', expect.any(Object))
    expect(generateCloudinaryUrl).toHaveBeenCalledWith('photo-3', expect.any(Object))
  })

  it('should handle image loading errors gracefully', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    // Mock a photo with invalid ID
    const photosWithError = [
      ...mockPhotos,
      {
        id: 'invalid-photo',
        caption: 'This will fail to load',
        order: 4,
        altText: 'Failed image'
      }
    ]

    const gallery = new PhotoGallery(photosWithError)
    const container = document.getElementById('app')
    gallery.render(container)

    // Simulate image error
    const images = container.querySelectorAll('img')
    const lastImage = images[images.length - 1]

    const errorEvent = new Event('error')
    lastImage.dispatchEvent(errorEvent)

    // Should show placeholder or handle error gracefully
    expect(lastImage.classList.contains('error') || lastImage.src.includes('placeholder')).toBe(true)
  })

  it('should be keyboard accessible', async () => {
    const { PhotoGallery } = await import('../../src/components/PhotoGallery.js')

    const gallery = new PhotoGallery(mockPhotos)
    const container = document.getElementById('app')
    gallery.render(container)

    const slideshowContainer = container.querySelector('.slideshow-container')

    // Should be focusable
    expect(slideshowContainer.tabIndex).toBeGreaterThanOrEqual(0)

    // Should handle keyboard events
    const leftArrow = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    const rightArrow = new KeyboardEvent('keydown', { key: 'ArrowRight' })

    slideshowContainer.dispatchEvent(rightArrow)
    expect(gallery.currentSlide).toBe(1)

    slideshowContainer.dispatchEvent(leftArrow)
    expect(gallery.currentSlide).toBe(0)
  })
})