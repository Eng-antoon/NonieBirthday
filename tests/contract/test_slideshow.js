import { describe, it, expect, beforeEach, vi } from 'vitest'

// Contract tests for slideshow controller - These MUST fail initially (TDD)
describe('Slideshow Controller Contract Tests', () => {
  let mockPhotos

  beforeEach(() => {
    mockPhotos = [
      {
        id: 'photo-1',
        caption: 'First photo',
        order: 1,
        altText: 'First photo description'
      },
      {
        id: 'photo-2',
        caption: 'Second photo',
        order: 2,
        altText: 'Second photo description'
      },
      {
        id: 'photo-3',
        caption: 'Third photo',
        order: 3,
        altText: 'Third photo description'
      }
    ]
  })

  describe('createSlideshow()', () => {
    it('should initialize slideshow and return controller', async () => {
      // This will fail until we implement createSlideshow
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)

      expect(controller).toBeDefined()
      expect(typeof controller).toBe('object')
    })

    it('should have required controller methods', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)

      expect(typeof controller.play).toBe('function')
      expect(typeof controller.pause).toBe('function')
      expect(typeof controller.goToSlide).toBe('function')
      expect(typeof controller.nextSlide).toBe('function')
      expect(typeof controller.previousSlide).toBe('function')
      expect(typeof controller.destroy).toBe('function')
    })

    it('should throw error for invalid photo data', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      expect(() => createSlideshow([])).toThrow()
      expect(() => createSlideshow(null)).toThrow()
      expect(() => createSlideshow(undefined)).toThrow()
    })
  })

  describe('SlideshowController interface', () => {
    let controller

    beforeEach(async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')
      controller = createSlideshow(mockPhotos)
    })

    describe('play()', () => {
      it('should start auto-advance with 5-second intervals', () => {
        // Mock timers to test auto-advance
        vi.useFakeTimers()

        controller.play()

        // Should start playing
        expect(controller.isPlaying).toBe(true)

        vi.useRealTimers()
      })

      it('should not start if already playing', () => {
        controller.play()
        const isPlaying1 = controller.isPlaying

        controller.play() // Try to start again
        const isPlaying2 = controller.isPlaying

        expect(isPlaying1).toBe(isPlaying2)
      })
    })

    describe('pause()', () => {
      it('should stop auto-advance', () => {
        controller.play()
        controller.pause()

        expect(controller.isPlaying).toBe(false)
      })

      it('should be safe to call when not playing', () => {
        expect(() => controller.pause()).not.toThrow()
      })
    })

    describe('goToSlide()', () => {
      it('should navigate to specific slide by index', () => {
        controller.goToSlide(1)
        expect(controller.currentSlide).toBe(1)

        controller.goToSlide(2)
        expect(controller.currentSlide).toBe(2)
      })

      it('should handle out of bounds indices gracefully', () => {
        expect(() => controller.goToSlide(-1)).not.toThrow()
        expect(() => controller.goToSlide(999)).not.toThrow()

        // Should clamp to valid range
        controller.goToSlide(-1)
        expect(controller.currentSlide).toBeGreaterThanOrEqual(0)

        controller.goToSlide(999)
        expect(controller.currentSlide).toBeLessThan(mockPhotos.length)
      })
    })

    describe('nextSlide()', () => {
      it('should advance to next slide', () => {
        const initialSlide = controller.currentSlide
        controller.nextSlide()
        expect(controller.currentSlide).toBe((initialSlide + 1) % mockPhotos.length)
      })

      it('should loop back to first slide after last', () => {
        controller.goToSlide(mockPhotos.length - 1) // Go to last slide
        controller.nextSlide()
        expect(controller.currentSlide).toBe(0)
      })
    })

    describe('previousSlide()', () => {
      it('should go to previous slide', () => {
        controller.goToSlide(1)
        controller.previousSlide()
        expect(controller.currentSlide).toBe(0)
      })

      it('should loop to last slide when going back from first', () => {
        controller.goToSlide(0)
        controller.previousSlide()
        expect(controller.currentSlide).toBe(mockPhotos.length - 1)
      })
    })

    describe('destroy()', () => {
      it('should clean up resources and stop playback', () => {
        controller.play()
        controller.destroy()

        expect(controller.isPlaying).toBe(false)
        expect(() => controller.play()).toThrow() // Should not work after destroy
      })

      it('should be safe to call multiple times', () => {
        controller.destroy()
        expect(() => controller.destroy()).not.toThrow()
      })
    })
  })

  describe('Auto-advance behavior', () => {
    it('should auto-advance every 5 seconds when playing', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      vi.useFakeTimers()

      const controller = createSlideshow(mockPhotos)
      controller.play()

      const initialSlide = controller.currentSlide

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000)

      expect(controller.currentSlide).toBe((initialSlide + 1) % mockPhotos.length)

      vi.useRealTimers()
    })

    it('should pause on hover/focus', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)
      controller.play()

      // Simulate hover
      controller.pauseOnHover(true)
      expect(controller.isAutoAdvancing).toBe(false)

      // Simulate mouse leave
      controller.pauseOnHover(false)
      expect(controller.isAutoAdvancing).toBe(true)
    })
  })

  describe('Touch/swipe support', () => {
    it('should support touch swipe navigation on mobile', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)

      // Should have swipe handler methods
      expect(typeof controller.handleSwipeLeft).toBe('function')
      expect(typeof controller.handleSwipeRight).toBe('function')
    })

    it('should handle swipe left to go to next slide', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)
      const initialSlide = controller.currentSlide

      controller.handleSwipeLeft()

      expect(controller.currentSlide).toBe((initialSlide + 1) % mockPhotos.length)
    })

    it('should handle swipe right to go to previous slide', async () => {
      const { createSlideshow } = await import('../../src/utils/slideshowController.js')

      const controller = createSlideshow(mockPhotos)
      controller.goToSlide(1) // Start at slide 1

      controller.handleSwipeRight()

      expect(controller.currentSlide).toBe(0)
    })
  })
})