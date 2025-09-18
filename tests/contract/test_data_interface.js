import { describe, it, expect } from 'vitest'

// Contract tests for data interface - These MUST fail initially (TDD)
describe('Data Interface Contract Tests', () => {
  describe('loadSiteData()', () => {
    it('should load and return valid site data structure', async () => {
      // This will fail until we implement loadSiteData
      const { loadSiteData } = await import('../../src/utils/dataLoader.js')

      const siteData = await loadSiteData()

      expect(siteData).toBeDefined()
      expect(siteData).toHaveProperty('config')
      expect(siteData).toHaveProperty('photos')
      expect(siteData).toHaveProperty('video')
      expect(siteData).toHaveProperty('messages')
    })

    it('should validate SiteContent structure', async () => {
      const { loadSiteData } = await import('../../src/utils/dataLoader.js')

      const siteData = await loadSiteData()
      const { config } = siteData

      expect(config).toHaveProperty('personalName')
      expect(config).toHaveProperty('heroMessage')
      expect(config).toHaveProperty('colorTheme')
      expect(config.colorTheme).toHaveProperty('primary')
      expect(config.colorTheme).toHaveProperty('secondary')
      expect(config.colorTheme).toHaveProperty('accent')
    })

    it('should validate PhotoSlide array structure', async () => {
      const { loadSiteData } = await import('../../src/utils/dataLoader.js')

      const siteData = await loadSiteData()
      const { photos } = siteData

      expect(Array.isArray(photos)).toBe(true)
      expect(photos.length).toBeGreaterThan(0)

      photos.forEach(photo => {
        expect(photo).toHaveProperty('id')
        expect(photo).toHaveProperty('caption')
        expect(photo).toHaveProperty('order')
        expect(photo).toHaveProperty('altText')
        expect(typeof photo.id).toBe('string')
        expect(typeof photo.caption).toBe('string')
        expect(typeof photo.order).toBe('number')
        expect(typeof photo.altText).toBe('string')
      })
    })

    it('should validate VideoMessage structure', async () => {
      const { loadSiteData } = await import('../../src/utils/dataLoader.js')

      const siteData = await loadSiteData()
      const { video } = siteData

      expect(video).toHaveProperty('title')
      expect(video).toHaveProperty('videoUrl')
      expect(video).toHaveProperty('duration')
      expect(typeof video.title).toBe('string')
      expect(typeof video.videoUrl).toBe('string')
      expect(typeof video.duration).toBe('number')
    })

    it('should validate DigitalCard array structure', async () => {
      const { loadSiteData } = await import('../../src/utils/dataLoader.js')

      const siteData = await loadSiteData()
      const { messages } = siteData

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBeGreaterThan(0)

      messages.forEach(message => {
        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('messageText')
        expect(message).toHaveProperty('animationType')
        expect(message).toHaveProperty('scrollTrigger')
        expect(message).toHaveProperty('backgroundColor')
        expect(message).toHaveProperty('order')
        expect(['flip', 'fade', 'slide', 'bounce']).toContain(message.animationType)
        expect(message.scrollTrigger).toBeGreaterThanOrEqual(0)
        expect(message.scrollTrigger).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('validatePhotoData()', () => {
    it('should validate photo array and return true for valid data', async () => {
      const { validatePhotoData } = await import('../../src/utils/dataLoader.js')

      const validPhotos = [
        {
          id: 'test-photo-1',
          caption: 'Test caption',
          order: 1,
          altText: 'Test alt text'
        }
      ]

      const result = validatePhotoData(validPhotos)
      expect(result).toBe(true)
    })

    it('should throw ValidationError for invalid photo data', async () => {
      const { validatePhotoData } = await import('../../src/utils/dataLoader.js')

      const invalidPhotos = [
        {
          id: '', // Invalid: empty ID
          caption: 'Test caption',
          order: 1,
          altText: 'Test alt text'
        }
      ]

      expect(() => validatePhotoData(invalidPhotos)).toThrow()
    })
  })

  describe('validateMessageData()', () => {
    it('should validate message array and return true for valid data', async () => {
      const { validateMessageData } = await import('../../src/utils/dataLoader.js')

      const validMessages = [
        {
          id: 'msg-1',
          messageText: 'Test message',
          animationType: 'fade',
          scrollTrigger: 75,
          backgroundColor: '#F8BBD9',
          order: 1
        }
      ]

      const result = validateMessageData(validMessages)
      expect(result).toBe(true)
    })

    it('should throw ValidationError for invalid animation type', async () => {
      const { validateMessageData } = await import('../../src/utils/dataLoader.js')

      const invalidMessages = [
        {
          id: 'msg-1',
          messageText: 'Test message',
          animationType: 'invalid-type', // Invalid animation type
          scrollTrigger: 75,
          backgroundColor: '#F8BBD9',
          order: 1
        }
      ]

      expect(() => validateMessageData(invalidMessages)).toThrow()
    })
  })
})