import { capitalize, camelToSnakeCase, snakeToCamelCase } from '../../utils/string-utils';

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should return the same string if already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(capitalize(null as unknown as string)).toBe(null);
      expect(capitalize(undefined as unknown as string)).toBe(undefined);
    });

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('camelToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnakeCase('helloWorld')).toBe('hello_world');
      expect(camelToSnakeCase('thisIsATest')).toBe('this_is_a_test');
    });

    it('should handle strings with no uppercase letters', () => {
      expect(camelToSnakeCase('hello')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(camelToSnakeCase('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(camelToSnakeCase(null as unknown as string)).toBe(null);
      expect(camelToSnakeCase(undefined as unknown as string)).toBe(undefined);
    });
  });

  describe('snakeToCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamelCase('hello_world')).toBe('helloWorld');
      expect(snakeToCamelCase('this_is_a_test')).toBe('thisIsATest');
    });

    it('should handle strings with no underscores', () => {
      expect(snakeToCamelCase('hello')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(snakeToCamelCase('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(snakeToCamelCase(null as unknown as string)).toBe(null);
      expect(snakeToCamelCase(undefined as unknown as string)).toBe(undefined);
    });
  });
});
