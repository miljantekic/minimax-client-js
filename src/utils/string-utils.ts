/**
 * String utility functions for the Minimax client
 */

/**
 * Capitalizes the first letter of a string
 * @param str - The input string
 * @returns The string with the first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a camelCase string to snake_case
 * @param str - The input string in camelCase
 * @returns The string converted to snake_case
 */
export function camelToSnakeCase(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase
 * @param str - The input string in snake_case
 * @returns The string converted to camelCase
 */
export function snakeToCamelCase(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
