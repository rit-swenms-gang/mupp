import { printDebugLog } from "./util";

/**
 * Signs out a user by invalidating their session on the server and clearing the session cookie.
 * @returns A promise that resolves when the user has been signed out or the request has been rejected.
 */
export const handleSignOut = async () => {
  printDebugLog('Handle sign out');

  const cookies = document.cookie.split(';').reduce(
    (acc: Record<string, string>, cookieStr: string) => {
      const [key, value] = cookieStr.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {});

  const sessionKey = cookies.session;

  if (!sessionKey) {
    throw new Error('Log out denied. User does not have an active session.');
  }

  try {
    await makeAuthFetch('http://localhost:5001/logout', {
      headers: { 'session-key': sessionKey },
      errorContext: 'Error on Sign Out',
    });

    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    printDebugLog('User has been logged out.');
  } catch (error) {
    throw error;
  }
}

/**
 * Handles the sign-up process by validating form data and sending a request to create a new account.
 * @param formData The form data containing the username, email, and password for sign-up.
 */
export const handleSignUp = async (formData?: FormData) => {
  printDebugLog('Handle Sign Up');

  const username = formData?.get('sign-up-username')?.toString();
  const email = formData?.get('sign-up-email')?.toString();
  const password = formData?.get('sign-up-password')?.toString();

  if (!username || !email || !password) {
    throw new Error('Username, email or password were not found in the Form Data.');
  }

  try {
    await makeAuthFetch('http://localhost:5001/accounts', {
      body: { username, email, password },
      errorContext: 'Error on Sign Up',
    });
    await login(email, password);
  } catch (error) {
    throw error;
  }
}

/**
 * Handles the sign-in process by validating form data and sending a login request.
 * @param formData The form data containing the email and password for sign-in.
 */
export const handleSignIn = async (formData?: FormData) => {
  printDebugLog('Handle Sign In');

  const email = formData?.get('sign-in-email')?.toString();
  const password = formData?.get('sign-in-password')?.toString();

  if (!email || !password) {
    throw new Error('Email or password were not found in the Form Data.');
  }

  try {
    await login(email, password);
  } catch (error) {
    throw error;
  }
}

/**
 * Logs in a user by sending their email and password to the server and storing the session key in a cookie.
 * @param email The user's email address.
 * @param password The user's password.
 * @throws An error if the login request fails.
 */
export const login = async (email: string, password: string) => {
  try {
    const resData = await makeAuthFetch('http://localhost:5001/login', {
      body: { email, password },
      errorContext: 'Error on Sign In',
    });

    if (resData?.session_key) {
      document.cookie = `session=${resData.session_key}`;
    } else {
      throw new Error('Session key not found in the response.');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Sends an authenticated POST request to the specified URL with the provided body and headers.
 * @param url The URL to send the request to.
 * @param options An object containing the request body, headers, and an optional error context.
 * @returns The response data from the server.
 * @throws An error if the response is not successful.
 */
export const makeAuthFetch = async (
  url: string,
  options?: {
    body?: Record<string, string>,
    headers?: Record<string, string>,
    errorContext?: string
  }
) => {
  const { body, headers, errorContext } = options || {};

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const resData = await response.json();

  if (!response.ok) {
    const message = `${errorContext || 'Error'}: Responded with status ${response.status}: 
      ${resData.message || 'Something went wrong'}`;
    throw new Error(message);
  }

  return resData;
}