import { useEffect, useState } from "react"
import { Button, Card, CardHeader, Nav, NavItem, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";
import AuthForm from "./AuthForm/AuthForm";

/**
 * Signs out a user by invalidating their session on the server and clearing the session cookie.
 * @returns A promise that resolves when the user has been signed out or the request has been rejected.
 */
export const handleSignOut = async () => {
  console.log('Handle sign out');

  const cookies = document.cookie.split(';').reduce(
    (acc: Record<string, string>, cookieStr: string) => {
      const [key, value] = cookieStr.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {});

  const sessionKey = cookies.session;

  if (!sessionKey) {
    console.error('Log out denied. User does not have an active session.');
    alert('Log in denied. You are not logged in.');
    return;
  }

  try {
    await makeAuthFetch('http://localhost:5001/logout', {
      headers: { 'session-key': sessionKey },
      errorContext: 'Error on Sign Out',
    });

    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    console.log('User has been logged out.');
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Sign Out failed:', errorMessage);
    alert(errorMessage);
  }
}

/**
 * Handles the sign-up process by validating form data and sending a request to create a new account.
 * @param formData The form data containing the username, email, and password for sign-up.
 */
const handleSignUp = async (formData?: FormData) => {
  console.log('Handle Sign Up');

  const username = formData?.get('sign-up-username')?.toString();
  const email = formData?.get('sign-up-email')?.toString();
  const password = formData?.get('sign-up-password')?.toString();

  if (!username || !email || !password) {
    console.error('Username, email or password were not found in the Form Data.');
    return;
  }

  try {
    await makeAuthFetch('http://localhost:5001/accounts', {
      body: { username, email, password },
      errorContext: 'Error on Sign Up',
    });
    await login(email, password);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Sign Up failed:', errorMessage);
    alert(errorMessage);
  }
}

/**
 * Handles the sign-in process by validating form data and sending a login request.
 * @param formData The form data containing the email and password for sign-in.
 */
const handleSignIn = async (formData?: FormData) => {
  console.log('Handle Sign In');

  const email = formData?.get('sign-in-email')?.toString();
  const password = formData?.get('sign-in-password')?.toString();

  if (!email || !password) {
    console.error('Email or password were not found in the Form Data.');
    return;
  }

  try {
    await login(email, password);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Sign In failed:', errorMessage);
    alert(errorMessage);
  }
}

/**
 * Logs in a user by sending their email and password to the server and storing the session key in a cookie.
 * @param email The user's email address.
 * @param password The user's password.
 * @throws An error if the login request fails.
 */
const login = async (email: string, password: string) => {
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
    if (error instanceof Error) {
      const errorMessage = getErrorMessage(error);
      console.error('Login failed:', errorMessage);
      throw new Error(errorMessage);  // rethrow error to be handled in the calling function
    }
  }
}

/**
 * Extracts the error message from an unknown error object.
 * @param error The error object to extract the message from.
 * @returns The error message if available, otherwise a default message.
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

/**
 * Sends an authenticated POST request to the specified URL with the provided body and headers.
 * @param url The URL to send the request to.
 * @param options An object containing the request body, headers, and an optional error context.
 * @returns The response data from the server.
 * @throws An error if the response is not successful.
 */
const makeAuthFetch = async (
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
    console.error(`${errorContext || 'Error'}: Responded with status ${response.status}: 
      ${resData.message || 'Something went wrong'}`);
    throw new Error(resData.message || 'Something went wrong');
  }

  return resData;
}

interface AuthenticatorProps {
  signOut: () => Promise<void>;
  children?: React.ReactNode;
}

export default function Authenticator({ signOut, children }: AuthenticatorProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if(isAuthenticated === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  /**
  * Changes the active tab in the authentication UI.
  * @param tabId The ID of the tab to switch to.
  */
  const changeTab = (tabId: number) => {
    if (tabId === activeTab)
      return;

    setActiveTab(tabId);
  }

  const handleSuccessfulSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  }

  const handleSuccessfulSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }

  // render content based on authentication status
  // if user is authenticated, show sign out button and children components
  if (isAuthenticated) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 vw-100">
        <Nav className='navbar w-100 p-4 bg-secondary'>
          <NavItem className="ms-auto">
            <Button onClick={() =>
              signOut().then(handleSuccessfulSignOut)}
              color="secondary">
              Sign Out
            </Button>
          </NavItem>
        </Nav>
        <div className="flex-grow-1 d-flex flex-column">{ children } </div>
      </div>
    );
  }

  // if user is not authenticated, show sign in and sign up forms
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 vw-100">
    <Card className="w-50">
      <CardHeader className="p-2 m-2" tag='h2'>Welcome to MUPP</CardHeader>

      <Nav justified tabs>
        <NavTab
          id={1}
          activeId={activeTab}
          onClick={() => changeTab(1)}
          label='Log In' />
        <NavTab
          id={2}
          activeId={activeTab}
          onClick={() => changeTab(2)}
          label='Register' />
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          {/* Sign In Form */}
          <AuthForm
            heading="Welcome Back"
            submitLabel="Sign In"
            onSubmit={(formData) => {
              handleSignIn(formData).then(handleSuccessfulSignIn);
            }}
            formFields={
              [
                {
                  name: "sign-in-email",
                  label: "Email",
                  type: 'email',
                  required: true
                },
                {
                  name: "sign-in-password",
                  label: "Password",
                  type: 'password',
                  required: true
                }
              ]
            }
          />
        </TabPane>
        <TabPane tabId={2}>
          {/* Create Account Form */}
          <AuthForm
            heading="Create an Account"
            submitLabel="Create Account"
            onSubmit={(formData) => {
              handleSignUp(formData).then(handleSuccessfulSignIn);
            }}
            validate={(data) => {
              const errors: Record<string, string> = {};
          
              const password = data.get("sign-up-password")?.toString();
              const confirmPassword = data.get("sign-up-confirm-password")?.toString();
          
              if (password !== confirmPassword) {
                errors["sign-up-confirm-password"] = "Passwords do not match.";
              }
          
              return errors;
            }}
            formFields={
              [
                {
                  name: "sign-up-username",
                  label: "Username",
                  required: true
                },
                {
                  name: "sign-up-email",
                  label: "Email",
                  type: 'email',
                  required: true
                },
                {
                  name: "sign-up-password",
                  label: "Password",
                  type: 'password',
                  required: true
                },
                {
                  name: "sign-up-confirm-password",
                  label: "Confirm Password",
                  type: 'password',
                  required: true
                }
              ]
            }
          />
        </TabPane>
      </TabContent>
    </Card>
    </div>
  );
}