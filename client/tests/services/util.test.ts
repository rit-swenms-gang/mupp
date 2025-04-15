import { describe, it, expect, vi } from "vitest";
import { getErrorMessage, printDebugLog } from "../../src/services/util";

describe("getErrorMessage", () => {
  it("should return the message from an Error object", () => {
    const error = new Error("Test error message");
    const result = getErrorMessage(error);
    expect(result).toBe("Test error message");
  });

  it("should return a default message for non-Error objects", () => {
    const error = { some: "object" };
    const result = getErrorMessage(error);
    expect(result).toBe("An unknown error occurred");
  });

  it("should return a default message for undefined", () => {
    const result = getErrorMessage(undefined);
    expect(result).toBe("An unknown error occurred");
  });
});

describe("printDebugLog", () => {
  it("should log the message in development mode", () => {
    // Mock the environment to be development
    vi.stubEnv('NODE_ENV', 'development');

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    printDebugLog("Test debug message");

    expect(consoleSpy).toHaveBeenCalledWith("Test debug message");

    // Restore the original console.log
    vi.unstubAllEnvs();
  });

  it("should not log the message in production mode", () => {
    // Mock the environment to be production
    vi.stubEnv('NODE_ENV', 'production');

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    printDebugLog("Test debug message");

    expect(consoleSpy).not.toHaveBeenCalled();

    // Restore the original console.log
    vi.unstubAllEnvs();
  });
});