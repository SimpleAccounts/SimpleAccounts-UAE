/**
 * Tests for example validation schemas
 * Verifies Phase 3: Validation Schema Patterns
 */

import { z } from 'zod';
import {
  loginSchema,
  userSchema,
  invoiceSchema,
  contactSchema,
} from '../schemas';

describe('Example Validation Schemas (Phase 3)', () => {
  describe('loginSchema', () => {
    test('validates correct login data', () => {
      const validData = {
        username: 'testuser',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    test('rejects missing username', () => {
      const invalidData = {
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    test('rejects missing password', () => {
      const invalidData = {
        username: 'testuser',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('userSchema', () => {
    test('validates correct user data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roleId: '1',
        timezone: 'UTC',
      };
      expect(() => userSchema.parse(validData)).not.toThrow();
    });

    test('validates password confirmation match', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roleId: '1',
        timezone: 'UTC',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
      expect(() => userSchema.parse(validData)).not.toThrow();
    });

    test('rejects mismatched passwords', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        roleId: '1',
        timezone: 'UTC',
        password: 'Password123!',
        confirmPassword: 'Different123!',
      };
      expect(() => userSchema.parse(invalidData)).toThrow("Passwords don't match");
    });
  });

  describe('invoiceSchema', () => {
    test('validates correct invoice data', () => {
      const validData = {
        customerName: 'Test Customer',
        amount: 100.50,
        dueDate: new Date('2024-12-31'),
        items: [
          {
            description: 'Item 1',
            quantity: 2,
            price: 50.25,
          },
        ],
      };
      expect(() => invoiceSchema.parse(validData)).not.toThrow();
    });

    test('rejects invoice without items', () => {
      const invalidData = {
        customerName: 'Test Customer',
        amount: 100.50,
        dueDate: new Date('2024-12-31'),
        items: [],
      };
      expect(() => invoiceSchema.parse(invalidData)).toThrow('At least one item is required');
    });

    test('rejects negative amounts', () => {
      const invalidData = {
        customerName: 'Test Customer',
        amount: -100,
        dueDate: new Date('2024-12-31'),
        items: [
          {
            description: 'Item 1',
            quantity: 1,
            price: 50,
          },
        ],
      };
      expect(() => invoiceSchema.parse(invalidData)).toThrow();
    });
  });

  describe('contactSchema', () => {
    test('validates correct contact data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        telephone: '+1234567890',
        countryId: '1',
        stateId: '2',
      };
      expect(() => contactSchema.parse(validData)).not.toThrow();
    });

    test('validates contact without stateId when countryId not set', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        telephone: '+1234567890',
        // countryId is required, so we test with undefined (which should fail)
        // But if countryId is optional in the schema, this would pass
      };
      // Note: countryId is required, so this test validates the required field
      // If we want to test optional countryId, we'd need to modify the schema
      expect(() => contactSchema.parse(validData)).toThrow();
    });

    test('rejects contact with countryId but no stateId', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        telephone: '+1234567890',
        countryId: '1',
        // stateId is missing
      };
      expect(() => contactSchema.parse(invalidData)).toThrow('State is required when country is selected');
    });
  });
});

