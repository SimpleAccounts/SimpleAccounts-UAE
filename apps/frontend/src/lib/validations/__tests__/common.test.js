/**
 * Tests for common validation schemas
 * Verifies Phase 3: Validation Schema Patterns
 */

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  requiredString,
  requiredNumber,
  positiveNumber,
  dateSchema,
} from '../common';

describe('Common Validation Schemas (Phase 3)', () => {
  describe('emailSchema', () => {
    test('validates correct email addresses', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name@domain.co.uk')).not.toThrow();
    });

    test('rejects invalid email addresses', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
      expect(() => emailSchema.parse('')).toThrow();
    });

    test('provides correct error message for empty email', () => {
      try {
        emailSchema.parse('');
      } catch (error) {
        // Zod v4 error structure
        const errorMessage = error.issues?.[0]?.message || error.errors?.[0]?.message;
        expect(errorMessage).toBe('Email is required');
      }
    });
  });

  describe('passwordSchema', () => {
    test('validates strong passwords', () => {
      expect(() => passwordSchema.parse('Password123!')).not.toThrow();
      expect(() => passwordSchema.parse('MyP@ssw0rd')).not.toThrow();
    });

    test('rejects weak passwords', () => {
      expect(() => passwordSchema.parse('short')).toThrow();
      expect(() => passwordSchema.parse('nouppercase123!')).toThrow();
      expect(() => passwordSchema.parse('NOLOWERCASE123!')).toThrow();
      expect(() => passwordSchema.parse('NoNumbers!')).toThrow();
      expect(() => passwordSchema.parse('NoSpecial123')).toThrow();
    });
  });

  describe('phoneSchema', () => {
    test('validates phone numbers', () => {
      expect(() => phoneSchema.parse('+1234567890')).not.toThrow();
      expect(() => phoneSchema.parse('(123) 456-7890')).not.toThrow();
      expect(() => phoneSchema.parse('123-456-7890')).not.toThrow();
    });

    test('rejects invalid phone numbers', () => {
      expect(() => phoneSchema.parse('abc')).toThrow();
      expect(() => phoneSchema.parse('')).toThrow();
    });
  });

  describe('requiredString', () => {
    test('validates non-empty strings', () => {
      const schema = requiredString('Custom message');
      expect(() => schema.parse('test')).not.toThrow();
      expect(() => schema.parse('   ')).not.toThrow(); // Spaces are valid
    });

    test('rejects empty strings', () => {
      const schema = requiredString('Custom message');
      expect(() => schema.parse('')).toThrow('Custom message');
    });
  });

  describe('requiredNumber', () => {
    test('validates numbers', () => {
      const schema = requiredNumber('Number required');
      expect(() => schema.parse(0)).not.toThrow();
      expect(() => schema.parse(42)).not.toThrow();
      expect(() => schema.parse(-5)).not.toThrow();
    });

    test('coerces string numbers from HTML inputs', () => {
      const schema = requiredNumber('Number required');
      // HTML number inputs return strings, so we need to coerce them
      expect(() => schema.parse('0')).not.toThrow();
      expect(() => schema.parse('42')).not.toThrow();
      expect(() => schema.parse('-5')).not.toThrow();
      expect(() => schema.parse('100')).not.toThrow();
      // Verify the coerced value is actually a number
      expect(schema.parse('42')).toBe(42);
      expect(schema.parse('100')).toBe(100);
    });

    test('rejects non-numeric strings', () => {
      const schema = requiredNumber('Number required');
      expect(() => schema.parse('not a number')).toThrow();
      expect(() => schema.parse('abc123')).toThrow();
    });

    test('rejects null and undefined', () => {
      const schema = requiredNumber('Number required');
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
    });
  });

  describe('positiveNumber', () => {
    test('validates positive numbers', () => {
      expect(() => positiveNumber().parse(1)).not.toThrow();
      expect(() => positiveNumber().parse(100)).not.toThrow();
    });

    test('coerces string numbers from HTML inputs', () => {
      // HTML number inputs return strings, so we need to coerce them
      expect(() => positiveNumber().parse('1')).not.toThrow();
      expect(() => positiveNumber().parse('100')).not.toThrow();
      // Verify the coerced value is actually a number
      expect(positiveNumber().parse('100')).toBe(100);
      expect(positiveNumber().parse('42')).toBe(42);
    });

    test('rejects zero and negative numbers', () => {
      expect(() => positiveNumber().parse(0)).toThrow();
      expect(() => positiveNumber().parse(-1)).toThrow();
      expect(() => positiveNumber().parse('0')).toThrow();
      expect(() => positiveNumber().parse('-1')).toThrow();
    });

    test('rejects non-numeric strings', () => {
      expect(() => positiveNumber().parse('not a number')).toThrow();
      expect(() => positiveNumber().parse('abc')).toThrow();
    });
  });

  describe('dateSchema', () => {
    test('validates date objects', () => {
      expect(() => dateSchema.parse(new Date())).not.toThrow();
      expect(() => dateSchema.parse(new Date('2023-01-01'))).not.toThrow();
    });

    test('rejects invalid dates', () => {
      expect(() => dateSchema.parse('not a date')).toThrow();
      expect(() => dateSchema.parse(123)).toThrow();
    });
  });
});

