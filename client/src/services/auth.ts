import { printDebugLog } from './util';

/**
 * Signs out a user by invalidating their session on the server and clearing the session cookie.
 * @param fetchLogout A function to make the logout request (default is makeAuthFetch).
 * @throws An error if the user does not have an active session.
 * @throws An error if the logout request fails.
 * @returns A promise that resolves when the user has been signed out or the request has been rejected.
 */
export const handleSignOut = async (fetchLogout = makeAuthFetch) => {
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

  await fetchLogout('http://localhost:5001/logout', {
    headers: { 'session-key': sessionKey },
    errorContext: 'Error on Sign Out',
  });

  document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  printDebugLog('User has been logged out.');
  
}

/**
 * Handles the sign-up process by validating form data and sending a request to create a new account.
 * @param formData The form data containing the username, email, and password for sign-up.
 * @param fetchAccounts A function to make the account creation request (default is makeAuthFetch).
 * @param callLogin A function to make the login request (default is login).
 * @throws An error if the username, email, or password is not found in the form data.
 * @throws An error if the account creation request fails.
 * @throws An error if the login request fails.
 * @throws An error if the session key is not found in the response.
 * @returns A promise that resolves when the user has been logged in or the request has been rejected.
 */
export const handleSignUp = async (formData?: FormData, fetchAccounts = makeAuthFetch, callLogin = login) => {
  printDebugLog('Handle Sign Up');

  const username = formData?.get('sign-up-username')?.toString();
  const email = formData?.get('sign-up-email')?.toString();
  const password = formData?.get('sign-up-password')?.toString();

  if (!username || !email || !password) {
    throw new Error('Username, email or password were not found in the Form Data.');
  }

  await fetchAccounts('http://localhost:5001/accounts', {
    body: { username, email, password },
    errorContext: 'Error on Sign Up',
  });
  await callLogin(email, password);
}

/**
 * Handles the sign-in process by validating form data and sending a login request.
 * @param formData The form data containing the email and password for sign-in.
 * @param callLogin A function to make the login request (default is login).
 * @throws An error if the email or password is not found in the form data.
 * @throws An error if the login request fails.
 * @throws An error if the session key is not found in the response.
 * @returns A promise that resolves when the user has been logged in or the request has been rejected.
 */
export const handleSignIn = async (formData?: FormData, callLogin = login) => {
  printDebugLog('Handle Sign In');

  const email = formData?.get('sign-in-email')?.toString();
  const password = formData?.get('sign-in-password')?.toString();

  if (!email || !password) {
    throw new Error('Email or password were not found in the Form Data.');
  }

  await callLogin(email, password);
}

/**
 * Logs in a user by sending their email and password to the server and storing the session key in a cookie.
 * @param email The user's email address.
 * @param password The user's password.
 * @param fetchLogin A function to make the login request (default is makeAuthFetch).
 * @throws An error if the login request fails.
 * @throws An error if a session key is not found in the response.
 * @returns A promise that resolves when the user has been logged in or the request has been rejected.
 */
export const login = async (email: string, password: string, fetchLogin = makeAuthFetch) => {
  const resData = await fetchLogin('http://localhost:5001/login', {
    body: { email, password },
    errorContext: 'Error on Sign In',
  });

  if (resData?.session_key) {
    document.cookie = `session=${resData.session_key}`;
  } else {
    throw new Error('Session key not found in the response.');
  }
}

/**
 * Sends an authenticated POST request to the specified URL with the provided body and headers.
 * @param url The URL to send the request to.
 * @param options An object containing the request body, headers, and an optional error context.
 * @throws An error if the response is not successful.
 * @returns The response data from the server.
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
    const message = `${errorContext || 'Error'}: Responded with status ${response.status}: ` + 
    `${resData.message || 'Something went wrong'}`;
    throw new Error(message);
  }

  return resData;
}

/**
 * Validates the sign-up form data by checking if the password and confirm password fields match.
 * @param formData The form data containing the password and confirm password fields.
 * @returns An object containing any validation errors.
 */
export const validateSignUp = (formData: FormData) => {
  const errors: Record<string, string> = {};
          
  const password = formData.get('sign-up-password')?.toString();
  const confirmPassword = formData.get('sign-up-confirm-password')?.toString();

  if (password !== confirmPassword) {
    errors['sign-up-confirm-password'] = 'Passwords do not match.';
  }

  return errors;
}

/**
 * Validates the sign-in form data by checking if the email and password fields are filled.
 * @param formData The form data containing the email and password fields.
 * @returns An object containing any validation errors.
 */
export const validateSignIn = (formData: FormData) => {
  const errors: Record<string, string> = {};

  // Required is currently handled by Reactstrap flag
  const email = formData.get('sign-in-email')?.toString();
  const password = formData.get('sign-in-password')?.toString();

  if (!email) {
    errors['sign-in-email'] = 'Email is required.';
  }

  if (!password) {
    errors['sign-in-password'] = 'Password is required.';
  }

  return errors;
}