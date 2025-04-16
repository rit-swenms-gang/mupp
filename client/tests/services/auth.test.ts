import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSignOut, handleSignIn, handleSignUp, login, makeAuthFetch, validateSignIn, validateSignUp} from '../../src/services/auth';

const testKey = 'test-session-key';
const testUsername = 'testuser';
const testEmail = 'test@example.com';
const testPassword = 'password123';

const signInFields = {
  email: 'sign-in-email',
  password: 'sign-in-password'
};

const signUpFields = {
  username: 'sign-up-username',
  email: 'sign-up-email',
  password: 'sign-up-password',
  confirmPassword: 'sign-up-confirm-password'
};

describe('handleSignOut', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.cookie = '';
  });

  it('should call fetchLogout and clear the session cookie', async () => {
    // Test that fetchLogout is called with the correct arguments and the session cookie is cleared
    const mockFetchLogout = vi.fn().mockResolvedValue({});
    document.cookie = `session=${testKey}`;

    await handleSignOut(mockFetchLogout);

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
    await expect(handleSignOut()).rejects.toThrow(
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
    formData.append(signUpFields.username, testUsername);
    formData.append(signUpFields.email, testEmail);
    formData.append(signUpFields.password, testPassword);

    await handleSignUp(formData, mockFetchAccounts, mockLogin);

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
    formData.append(signUpFields.username, testUsername);

    await expect(handleSignUp(formData)).rejects.toThrow(
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
    formData.append(signInFields.email, testEmail);
    formData.append(signInFields.password, testPassword);

    await handleSignIn(formData, mockLogin);

    expect(mockLogin).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it('should throw an error if email or password is missing', async () => {
    // Test that an error is thrown when email or password is missing in the form data
    const formData = new FormData();
    formData.append(signInFields.email, testEmail);

    await expect(handleSignIn(formData)).rejects.toThrow(
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
    await login(testEmail, testPassword, mockFetchLogin);

    expect(mockFetchLogin).toHaveBeenCalledWith('http://localhost:5001/login', {
      body: { email: testEmail, password: testPassword },
      errorContext: 'Error on Sign In',
    });

    expect(document.cookie).toContain(`session=${testKey}`);
  });

  it('should throw an error if the session key is missing', async () => {
    // Test that an error is thrown when the session key is missing in the response
    const mockFetchLogin = vi.fn().mockResolvedValue({});

    await expect(login(testEmail, testPassword, mockFetchLogin)).rejects.toThrow(
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
    const body = { key: 'value' };

    const result = await makeAuthFetch(testUrl, {
      body: body,
    });

    expect(fetch).toHaveBeenCalledWith(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    const body = { key: 'value' };

    await expect(
      makeAuthFetch(testUrl, {
        body: body,
        errorContext: 'Test Error',
      })
    ).rejects.toThrow('Test Error: Responded with status 400: Bad Request');

    expect(fetch).toHaveBeenCalledWith(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });

  it('handles undefined options gracefully', async () => {
    // Test that makeAuthFetch handles undefined options gracefully
    const mockResponse = { success: true };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
  
    const result = await makeAuthFetch(testUrl);
  
    expect(fetch).toHaveBeenCalledWith(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws a generic error when resData.message is missing', async () => {
    // Test that makeAuthFetch throws a generic error when resData.message is missing
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValueOnce({}),
    });
  
    await expect(
      makeAuthFetch(testUrl, {
        errorContext: 'Server Error',
      })
    ).rejects.toThrow('Server Error: Responded with status 500: Something went wrong');
  });
});

describe('validateSignUp', () => {
  it('should return an error if passwords do not match', () => {
    // Test that validateSignUp returns an error if passwords do not match
    const formData = new FormData();
    formData.append(signUpFields.username, testUsername);
    formData.append(signUpFields.email, testEmail);
    formData.append(signUpFields.password, testPassword);
    formData.append(signUpFields.confirmPassword, testPassword + '1');

    const errors = validateSignUp(formData);

    expect(errors).toEqual({
      [signUpFields.confirmPassword]: 'Passwords do not match.',
    });
  });

  it('should return an error if all required fields are missing', () => {
    // Test that validateSignUp returns errors if required fields are missing
    const formData = new FormData();

    const errors = validateSignUp(formData);

    expect(errors).toEqual({
      [signUpFields.username]: 'Username is required.',
      [signUpFields.email]: 'Email is required.',
      [signUpFields.password]: 'Password is required.',
      [signUpFields.confirmPassword]: 'Confirm Password is required.',
    });
  });

  it('should return an error if any required fields are missing', () => {
    // Test that validateSignUp returns errors if required fields are missing
    const formData = new FormData();
    formData.append(signUpFields.username, testUsername);
    formData.append(signUpFields.password, testPassword);

    const errors = validateSignUp(formData);

    expect(errors).toEqual({
      [signUpFields.email]: 'Email is required.',
      [signUpFields.confirmPassword]: 'Confirm Password is required.',
    });
  });

  it('should return no errors if all fields are valid', () => {
    // Test that validateSignUp returns no errors if all fields are valid
    const formData = new FormData();
    formData.append(signUpFields.username, testUsername);
    formData.append(signUpFields.email, testEmail);
    formData.append(signUpFields.password, testPassword);
    formData.append(signUpFields.confirmPassword, testPassword);

    const errors = validateSignUp(formData);

    expect(errors).toEqual({});
  });
});

describe('validateSignIn', () => {
  // Test that validateSignIn returns an error if email or password is missing
  it('should return an error if email is missing', () => {
    const formData = new FormData();
    formData.append(signInFields.password, testPassword);

    const errors = validateSignIn(formData);

    expect(errors).toEqual({
      [signInFields.email]: 'Email is required.',
    });
  });

  it('should return an error if password is missing', () => {
    // Test that validateSignIn returns an error if password is missing
    const formData = new FormData();
    formData.append(signInFields.email, testEmail);

    const errors = validateSignIn(formData);

    expect(errors).toEqual({
      [signInFields.password]: 'Password is required.',
    });
  });

  it('should return no errors if both email and password are provided', () => {
    // Test that validateSignIn returns no errors if both email and password are provided
    const formData = new FormData();
    formData.append(signInFields.email, testEmail);
    formData.append(signInFields.password, testPassword);

    const errors = validateSignIn(formData);

    expect(errors).toEqual({});
  });
});