import { describe, it, expect } from 'vitest'
import { parseRadius } from './parse-radius.js'

describe('parseRadius', () => {
  describe('accepted inputs', () => {
    it('parses a unitless integer', () => {
      expect(parseRadius('10', 8)).toBe(10)
    })

    it('parses a px integer', () => {
      expect(parseRadius('10px', 8)).toBe(10)
    })

    it('parses a unitless decimal', () => {
      expect(parseRadius('12.5', 8)).toBe(12.5)
    })

    it('parses a px decimal', () => {
      expect(parseRadius('12.5px', 8)).toBe(12.5)
    })

    it('preserves zero (unitless)', () => {
      expect(parseRadius('0', 8)).toBe(0)
    })

    it('preserves zero (px)', () => {
      expect(parseRadius('0px', 8)).toBe(0)
    })

    it('trims whitespace', () => {
      expect(parseRadius(' 10px ', 8)).toBe(10)
    })
  })

  describe('rejected inputs (return fallback)', () => {
    it('rejects rem values', () => {
      expect(parseRadius('0.5rem', 8)).toBe(8)
    })

    it('rejects em values', () => {
      expect(parseRadius('1em', 8)).toBe(8)
    })

    it('rejects percentage values', () => {
      expect(parseRadius('50%', 8)).toBe(8)
    })

    it('rejects var() expressions', () => {
      expect(parseRadius('var(--radius)', 8)).toBe(8)
    })

    it('rejects non-numeric strings', () => {
      expect(parseRadius('abc', 8)).toBe(8)
    })

    it('returns fallback for undefined', () => {
      expect(parseRadius(undefined, 8)).toBe(8)
    })

    it('returns fallback for empty string', () => {
      expect(parseRadius('', 8)).toBe(8)
    })
  })

  describe('fallback variations', () => {
    it('uses fallback 0 for undefined input', () => {
      expect(parseRadius(undefined, 0)).toBe(0)
    })

    it('uses fallback 12 for invalid input', () => {
      expect(parseRadius('invalid', 12)).toBe(12)
    })
  })
})
