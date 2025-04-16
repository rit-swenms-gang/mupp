import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '../../src/services/auth';

const testKey = 'test-session-key';
const testUsername = 'testuser';
const testEmail = 'test@example.com';
const testPassword = 'password123';

describe('handleSignOut', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.cookie = '';
  });

  it('should call fetchLogout and clear the session cookie', async () => {
    // Test that fetchLogout is called with the correct arguments and the session cookie is cleared
    const mockFetchLogout = vi.fn().mockResolvedValue({});
    document.cookie = `session=${testKey}`;

    await auth.handleSignOut(mockFetchLogout);

    expect(mockFetchLogout).toHaveBeenCalledWith(
      'http://localhost:5001/logout',
      {
        headers: { 'session-key': testKey },
        errorContext: 'Error on Sign Out',
      }
    );
    expect(document.cookie).toBe('');
  });

  it('should throw an error if no session key is found', async () => {
    // Test that an error is thrown when no session key is present in cookies
    await expect(auth.handleSignOut()).rejects.toThrow(
      'Log out denied. User does not have an active session.'
    );
  });
});

describe('handleSignUp', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call fetchAccounts and login on successful sign-up', async () => {
    // Test that fetchAccounts and login are called with the correct arguments during sign-up
    const mockFetchAccounts = vi.fn().mockResolvedValue({});
    const mockLogin = vi.fn().mockResolvedValue({});

    const formData = new FormData();
    formData.append('sign-up-username', testUsername);
    formData.append('sign-up-email', testEmail);
    formData.append('sign-up-password', testPassword);

    await auth.handleSignUp(formData, mockFetchAccounts, mockLogin);

    expect(mockFetchAccounts).toHaveBeenCalledWith(
      'http://localhost:5001/accounts',
      {
        body: {
          username: testUsername,
          email: testEmail,
          password: testPassword,
        },
        errorContext: 'Error on Sign Up',
      }
    );
    expect(mockLogin).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it('should throw an error if required fields are missing', async () => {
    // Test that an error is thrown when required fields are missing in the form data
    const formData = new FormData();
    formData.append('sign-up-username', testUsername);

    await expect(auth.handleSignUp(formData)).rejects.toThrow(
      'Username, email or password were not found in the Form Data.'
    );
  });
});

describe('handleSignIn', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call login on successful sign-in', async () => {
    // Test that login is called with the correct credentials during sign-in
    const mockLogin = vi.fn().mockResolvedValue({});
    const formData = new FormData();
    formData.append('sign-in-email', testEmail);
    formData.append('sign-in-password', testPassword);

    await auth.handleSignIn(formData, mockLogin);

    expect(mockLogin).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it('should throw an error if email or password is missing', async () => {
    // Test that an error is thrown when email or password is missing in the form data
    const formData = new FormData();
    formData.append('sign-in-email', testEmail);

    await expect(auth.handleSignIn(formData)).rejects.toThrow(
      'Email or password were not found in the Form Data.'
    );
  });
});

describe('login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should store the session key in a cookie on successful login', async () => {
    // Test that the session key is stored in a cookie after a successful login
    const mockFetchLogin = vi.fn().mockResolvedValue({ session_key: testKey });

    document.cookie = ''; // Clear cookies
    await auth.login(testEmail, testPassword, mockFetchLogin);

    expect(mockFetchLogin).toHaveBeenCalledWith('http://localhost:5001/login', {
      body: { email: testEmail, password: testPassword },
      errorContext: 'Error on Sign In',
    });

    expect(document.cookie).toContain(`session=${testKey}`);
  });

  it('should throw an error if the session key is missing', async () => {
    // Test that an error is thrown when the session key is missing in the response
    const mockFetchLogin = vi.fn().mockResolvedValue({});

    await expect(auth.login(testEmail, testPassword, mockFetchLogin)).rejects.toThrow(
      'Session key not found in the response.'
    );
  });
});

describe('makeAuthFetch', () => {
  const testUrl = 'http://localhost:5001/test';

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  it('should send a POST request and return response data', async () => {
    // Test that makeAuthFetch sends a POST request and returns the correct response data
    const mockResponse = { message: 'Success' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await auth.makeAuthFetch(testUrl, {
      body: { key: 'value' },
    });

    expect(fetch).toHaveBeenCalledWith(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if the response is not ok', async () => {
    // Test that makeAuthFetch throws an error when the response is not ok
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: 'Bad Request' }),
    });

    await expect(
      auth.makeAuthFetch(testUrl, {
        body: { key: 'value' },
        errorContext: 'Test Error',
      })
    ).rejects.toThrow('Test Error: Responded with status 400: Bad Request');
  });
});