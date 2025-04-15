import { useState } from "react"
import { Button, Nav, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";
import AuthForm from "./AuthForm/AuthForm";


export default function Authenticator() {
  const [activeTab, setActiveTab] = useState(1);

  /**
  * Changes the active tab in the authentication UI.
  * @param tabId The ID of the tab to switch to.
  */
  const changeTab = (tabId: number) => {
    if(tabId === activeTab)
      return;

    setActiveTab(tabId);
  }

  // TODO: validate sign in and sign up info

  /**
  * Handles the sign-up process by validating form data and sending a request to create a new account.
  * @param formData The form data containing the username, email, and password for sign-up.
  */
  const handleSignUp = async (formData?: FormData) => {
    console.log('Handle Sign Up');

    const username = formData?.get('sign-up-username')?.toString();
    const email = formData?.get('sign-up-email')?.toString();
    const password = formData?.get('sign-up-password')?.toString();

    if(!username || !email || !password) {
      console.error('Username, email or password were not found in the Form Data.');
      return;
    }

    await makeAuthFetch('http://localhost:5001/accounts', {username, email, password}, 'Error on Sign Up');
    await login(email, password);
  }

  /**
  * Handles the sign-in process by validating form data and sending a login request.
  * @param formData The form data containing the email and password for sign-in.
  */
  const handleSignIn = async (formData?: FormData) => {
    console.log('Handle Sign In');

    const email = formData?.get('sign-in-email')?.toString();
    const password = formData?.get('sign-in-password')?.toString();

    if(!email || !password) {
      console.error('Email or password were not found in the Form Data.');
      return;
    }

    await login(email, password);
  }

  /**
  * Logs in a user by sending their email and password to the server and storing the session key in a cookie.
  * @param email The user's email address.
  * @param password The user's password.
  */
  const login = async (email: string, password: string) => {
    const resData = await makeAuthFetch('http://localhost:5001/login', {email, password}, 'Error on Sign In');

    if(resData.session_key) {
      document.cookie = `session=${resData.session_key}`;
    }
  }

  /**
  * Signs out a user by invalidating their session on the server and clearing the session cookie.
  * @returns A promise that resolves when the user has been signed out or the request has been rejected.
  */
  const handleSignOut = async () => {
    console.log('Handle sign out');

    const cookies = document.cookie.split(';').reduce(
      (acc: Record<string, string>, cookieStr: string) => {
        const [key, value] = cookieStr.trim().split('=');
        acc[key] = value;
        return acc;
      }, 
    {});
      
    const sessionKey = cookies.session;
    
    if(!sessionKey) {
      console.error('Log out denied. User does not have an active session.');
      alert('Log in denied. You are not logged in.');
      return;
    }
    
    const response = await fetch('http://localhost:5001/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'session-key': sessionKey
      }
    });

    const resData = await response.json();
    if(!response.ok) {
      console.error(`Sign out responded with status ${response.status}: ${resData.message || 'Something went wrong'}`);
      alert(resData.message || 'Something went wrong');
      return;
    }

    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    console.log('User has been logged out.');
  }

  /**
  * Sends an authenticated POST request to the specified URL with the provided body.
  * @param url The URL to send the request to.
  * @param body The request body as a key-value object.
  * @param errorContext An optional context message for error logging.
  * @returns The response data from the server.
  */
  const makeAuthFetch = async (url: string, body?: Record<string, string>, errorContext?: string ) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const resData = await response.json();

    if(!response.ok) {
      console.error(`${errorContext || 'Error'}: Responded with status ${response.status}: ${resData.message || 'Something went wrong'}`);
      alert(resData.message || 'Something went wrong');
      return;
    }

    return resData;
  }

  return <>
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
        onSubmit={handleSignIn}
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
        onSubmit={handleSignUp}
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
              type:'password',
              required: true
            },
            {
              name: "sign-up-confirm-password",
              label: "Confirm Password",
              type:'password',
              required: true
            }
          ]
        }
      />
    </TabPane>
  </TabContent>
  <Button onClick={handleSignOut}>Sign Out</Button>
  </>
}