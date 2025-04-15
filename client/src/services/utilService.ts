/**
 * Extracts the error message from an unknown error object (common in ctach blocks).
 * @param error The error object to extract the message from.
 * @returns The error message if available, otherwise a default message.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};