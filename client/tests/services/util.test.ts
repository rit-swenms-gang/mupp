import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, printDebugError, printDebugLog } from '../../src/services/util';

describe('getErrorMessage', () => {
  it('should return the message from an Error object', () => {
    // Test that getErrorMessage extracts the message from an Error object
    const error = new Error('Test error message');
    const result = getErrorMessage(error);
    expect(result).toBe('Test error message');
  });

  it('should return a default message for non-Error objects', () => {
    // Test that getErrorMessage returns a default message for non-Error objects
    const error = { some: 'object' };
    const result = getErrorMessage(error);
    expect(result).toBe('An unknown error occurred');
  });

  it('should return a default message for undefined', () => {
    // Test that getErrorMessage returns a default message when the input is undefined
    const result = getErrorMessage(undefined);
    expect(result).toBe('An unknown error occurred');
  });
});

describe('printDebugLog', () => {
  it('should log the message in development mode', () => {
    // Test that printDebugLog logs messages when NODE_ENV is set to 'development'
    vi.stubEnv('MODE', 'development');  // mock environment variable

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printDebugLog('Test debug message');

    expect(consoleSpy).toHaveBeenCalledWith('Test debug message');

    // Restore the original environment variables
    vi.unstubAllEnvs();
  });

  it('should not log the message in production mode', () => {
    // Test that printDebugLog does not log messages when NODE_ENV is set to 'production'
    vi.stubEnv('MODE', 'production');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printDebugLog('Test debug message');

    expect(consoleSpy).not.toHaveBeenCalled();

    // Restore the original environment variables
    vi.unstubAllEnvs();
  });
});

describe('printDebugError', () => {
  it('should log the error message in development mode', () => {
    // Test that printDebugError logs the error message when NODE_ENV is set to 'development'
    vi.stubEnv('MODE', 'development');  // mock environment variable

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const error = new Error('Test error message');
    printDebugError(error);

    expect(consoleSpy).toHaveBeenCalledWith('Test error message');
    expect(alertSpy).toHaveBeenCalledWith('Test error message');

    // Restore the original environment variables
    vi.unstubAllEnvs();
  });

  it('should not log or alert in production mode', () => {
    // Test that printDebugError does not log or alert when NODE_ENV is set to 'production'
    vi.stubEnv('MODE', 'production');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const error = new Error('Test error message');
    printDebugError(error);

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();

    // Restore the original environment variables
    vi.unstubAllEnvs();
  });
});