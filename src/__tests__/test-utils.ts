/**
 * Test utilities for Minimax client tests
 */

/**
 * Creates a mock axios response
 * @param data - The response data
 * @param status - The HTTP status code (default: 200)
 * @param statusText - The status text (default: 'OK')
 * @param headers - The response headers (default: {})
 * @returns A mock axios response object
 */
export function createMockResponse<T>(
  data: T,
  status = 200,
  statusText = 'OK',
  headers = {}
): { data: T; status: number; statusText: string; headers: Record<string, unknown>; config: Record<string, unknown> } {
  return {
    data,
    status,
    statusText,
    headers,
    config: {},
  };
}

/**
 * Creates a mock axios error
 * @param message - The error message
 * @param code - The error code (default: 'ERR_BAD_REQUEST')
 * @param status - The HTTP status code (default: 400)
 * @returns A mock axios error object
 */
export function createMockError(
  message: string,
  code = 'ERR_BAD_REQUEST',
  status = 400
): Error & { code: string; response: { status: number; data: { message: string }; headers: Record<string, unknown>; config: Record<string, unknown> } } {
  const error = new Error(message) as Error & { code: string; response: { status: number; data: { message: string }; headers: Record<string, unknown>; config: Record<string, unknown> } };
  error.code = code;
  error.response = {
    status,
    data: { message },
    headers: {},
    config: {},
  };
  return error;
}

/**
 * Waits for a specified amount of time
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
