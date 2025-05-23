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

/**
 * Prints a message to the console only if the environment is development.
 * @param message The message to log.
 */
export const printDebugLog = (message: string) => {
  if (import.meta.env.MODE === 'development') {
    console.log(message);
  }
}

/**
 * Prints an error message to the console and alerts the user if the environment is development.
 * @param error The error object to extract the message from.
 */
export const printDebugError = (error: unknown) => {
  if (import.meta.env.MODE === 'development') {
    const message = getErrorMessage(error);
    console.error(message);
    alert(message);
  }
}