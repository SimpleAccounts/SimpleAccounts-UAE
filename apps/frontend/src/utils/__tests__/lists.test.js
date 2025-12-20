/**
 * Tests for lists utility (data exports)
 */

import { Address, termList, placeList } from '../lists';

describe('Lists Utility', () => {
  describe('Address', () => {
    it('should export Address object with all required fields', () => {
      expect(Address).toBeDefined();
      expect(Address).toHaveProperty('email');
      expect(Address).toHaveProperty('city');
      expect(Address).toHaveProperty('countryId');
      expect(Address).toHaveProperty('address');
      expect(Address).toHaveProperty('postZipCode');
      expect(Address).toHaveProperty('stateId');
      expect(Address).toHaveProperty('telephone');
      expect(Address).toHaveProperty('fax');
    });

    it('should have empty string defaults for all fields', () => {
      expect(Address.email).toBe('');
      expect(Address.city).toBe('');
      expect(Address.countryId).toBe('');
      expect(Address.address).toBe('');
      expect(Address.postZipCode).toBe('');
      expect(Address.stateId).toBe('');
      expect(Address.telephone).toBe('');
      expect(Address.fax).toBe('');
    });
  });

  describe('termList', () => {
    it('should export termList array', () => {
      expect(Array.isArray(termList)).toBe(true);
      expect(termList.length).toBeGreaterThan(0);
    });

    it('should have Select Terms as first option', () => {
      expect(termList[0].label).toBe('Select Terms');
      expect(termList[0].value).toBe('');
    });

    it('should have all terms with label and value', () => {
      termList.forEach(term => {
        expect(term).toHaveProperty('label');
        expect(term).toHaveProperty('value');
      });
    });

    it('should include common payment terms', () => {
      const labels = termList.map(t => t.label);
      expect(labels).toContain('Net 7 Days');
      expect(labels).toContain('Net 30 Days');
      expect(labels).toContain('Due on Receipt');
    });
  });

  describe('placeList', () => {
    it('should export placeList array', () => {
      expect(Array.isArray(placeList)).toBe(true);
      expect(placeList.length).toBeGreaterThan(0);
    });

    it('should have Select Place of Supply as first option', () => {
      expect(placeList[0].label).toBe('Select Place of Supply');
      expect(placeList[0].value).toBe('');
    });

    it('should include UAE emirates', () => {
      const labels = placeList.map(p => p.label);
      expect(labels).toContain('Abu Dhabi');
      expect(labels).toContain('Dubai');
      expect(labels).toContain('Sharjah');
    });

    it('should have all places with label and value', () => {
      placeList.forEach(place => {
        expect(place).toHaveProperty('label');
        expect(place).toHaveProperty('value');
      });
    });
  });
});
