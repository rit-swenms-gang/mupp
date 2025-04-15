import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auth from "../../src/services/auth";

const testKey = 'test-session-key';
const testUsername = 'testuser';
const testEmail = 'test@example.com';
const testPassword = 'password123';

describe("makeAuthFetch", () => {
  const testUrl = "http://localhost:5001/test";

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  it("should send a POST request and return response data", async () => {
    const mockResponse = { message: "Success" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await auth.makeAuthFetch(testUrl, {
      body: { key: "value" },
    });

    expect(fetch).toHaveBeenCalledWith(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "value" }),
    });
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error if the response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "Bad Request" }),
    });

    await expect(
      auth.makeAuthFetch(testUrl, {
        body: { key: "value" },
        errorContext: "Test Error",
      })
    ).rejects.toThrow("Test Error: Responded with status 400: Bad Request");
  });
});

describe("login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should store the session key in a cookie on successful login", async () => {
    const mockResponse = { session_key: testKey };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    document.cookie = ""; // Clear cookies
    await auth.login(testEmail, testPassword);

    expect(document.cookie).toContain(`session=${testKey}`);
  });

  it("should throw an error if the session key is missing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    await expect(auth.login(testEmail, testPassword)).rejects.toThrow(
      "Session key not found in the response."
    );
  });
});

describe("handleSignIn", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call login on successful sign-in", async () => {
    const loginSpy = vi.spyOn(auth, "login").mockResolvedValue();
    const formData = new FormData();
    formData.append("sign-in-email", testEmail);
    formData.append("sign-in-password", testPassword);

    await auth.handleSignIn(formData);

    expect(loginSpy).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it("should throw an error if email or password is missing", async () => {
    const formData = new FormData();
    formData.append("sign-in-email", testEmail);

    await expect(auth.handleSignIn(formData)).rejects.toThrow(
      "Email or password were not found in the Form Data."
    );
  });
});

describe("handleSignUp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call makeAuthFetch and login on successful sign-up", async () => {
    const makeAuthFetchSpy = vi.spyOn(auth, "makeAuthFetch").mockResolvedValue({'message': "Success"});
    const loginSpy = vi.spyOn(auth, "login").mockResolvedValue();

    const formData = new FormData();
    formData.append("sign-up-username", testUsername);
    formData.append("sign-up-email", testEmail);
    formData.append("sign-up-password", testPassword);

    await auth.handleSignUp(formData);

    expect(makeAuthFetchSpy).toHaveBeenCalledWith(
      "http://localhost:5001/accounts",
      {
        body: {
          username: testUsername,
          email: testEmail,
          password: testPassword,
        },
        errorContext: "Error on Sign Up",
      }
    );
    expect(loginSpy).toHaveBeenCalledWith(testEmail, testPassword);
  });

  it("should throw an error if required fields are missing", async () => {
    const formData = new FormData();
    formData.append("sign-up-username", testUsername);

    await expect(auth.handleSignUp(formData)).rejects.toThrow(
      "Username, email or password were not found in the Form Data."
    );
  });
});

describe("handleSignOut", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call makeAuthFetch and clear the session cookie", async () => {
    const makeAuthFetchSpy = vi.spyOn(auth, "makeAuthFetch").mockResolvedValue({'message': "Success"});
    document.cookie = "session=test-session-key";

    await auth.handleSignOut();

    expect(makeAuthFetchSpy).toHaveBeenCalledWith(
      "http://localhost:5001/logout",
      {
        headers: { "session-key": testKey },
        errorContext: "Error on Sign Out",
      }
    );
    expect(document.cookie).toContain("session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;");
  });

  it("should throw an error if no session key is found", async () => {
    document.cookie = ""; // Clear cookies

    await expect(auth.handleSignOut()).rejects.toThrow(
      "Log out denied. User does not have an active session."
    );
  });
});