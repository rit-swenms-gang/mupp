import { useEffect, useState } from 'react'
import { Button, Card, CardHeader, Nav, NavItem, TabContent, TabPane } from 'reactstrap'
import NavTab from '../NavTab/NavTab';
import AuthForm from './AuthForm/AuthForm';
import { handleSignIn, handleSignOut, handleSignUp, validateSignIn, validateSignUp } from '../services/auth';
import { printDebugError } from '../services/util';

/**
 * Props for the Authenticator component.
 * @param services - An object containing service functions for authentication.
 * @param children - The child components to render when authenticated.
 */
interface AuthenticatorProps {
  /**
   * An object containing service functions for authentication.
   * - handleSignOut: Function to handle sign-out.
   * - handleSignIn: Function to handle sign-in.
   * - handleSignUp: Function to handle sign-up.
   * - onError: Function to handle errors.
   * - validateSignIn: Function to validate sign-in data.
   * - validateSignUp: Function to validate sign-up data.
   */
  services?: {
    /**
     * Function to handle sign-out.
     * @returns Promise<void>
     */
    handleSignOut?: () => Promise<void>;
    /**
     * Function to handle sign-in.
     * @param data - The form data from the sign-in form.
     * @returns Promise<void>
     */
    handleSignIn?: (data?: FormData) => Promise<void>;
    /**
     * Function to handle sign-up.
     * @param data - The form data from the sign-up form.
     * @returns Promise<void>
     */
    handleSignUp?: (data?: FormData) => Promise<void>;
    /**
     * Function to handle errors.
     * @param error - The error object.
     */
    onError?: (error: unknown) => void;
    /**
     * Function to validate sign-in and sign-up data.
     * @param data - The form data to validate.
     * @returns An object with field names as keys and error messages as values.
     */
    validateSignIn?: (data: FormData) => Record<string, string>;
    /**
     * Function to validate sign-up data.
     * @param data - The form data to validate.
     * @returns An object with field names as keys and error messages as values.
     */
    validateSignUp?: (data: FormData) => Record<string, string>;
  };
  /**
   * The child components to render when authenticated.
   */
  children?: React.ReactNode;
}

export default function Authenticator({ 
  services = { 
    handleSignOut, 
    handleSignIn, 
    handleSignUp, 
    onError: printDebugError,
    validateSignIn,
    validateSignUp
  },
  children 
}: Readonly<AuthenticatorProps>) {
  const [activeTab, setActiveTab] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Checks if the user is authenticated when the component mounts.
   * Authentication determines how the UI is rendered.
   */
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if(isAuthenticated === 'true') {
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

  /**
   * Handles sign-in form submission.
   * @param formData The form data from the sign-in form.
   */
  const handleSignInSubmit = async (formData?: FormData) => {
    services.handleSignIn?.(formData)
      .then(handleSuccessfulSignIn)
      .catch(services.onError);
  };
  
  /**
   * Handles sign-up form submission.
   * @param formData The form data from the sign-up form.
   */
  const handleSignUpSubmit = async (formData?: FormData) => {
    services.handleSignUp?.(formData)
      .then(handleSuccessfulSignIn)
      .catch(services.onError);
  };

  /**
   * Handles sign-out form submission.
   */
  const handleSignOutSubmit = () => { 
    services.handleSignOut?.()
      .then(handleSuccessfulSignOut)
      .catch(services.onError);
  }

  /**
   * Handles successful sign-in by updating the authentication state and storing it in local storage.
   */
  const handleSuccessfulSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  }

  /**
   * Handles successful sign-out by updating the authentication state and removing it from local storage.
   */
  const handleSuccessfulSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  }

  // render content based on authentication status
  // if user is authenticated, show sign out button and children components
  if (isAuthenticated) {
    return (
      <div className='d-flex flex-column align-items-center justify-content-center vh-100 vw-100'>
        <Nav className='navbar w-100 p-4 bg-secondary'>
          <NavItem className='ms-auto'>
            <Button onClick={handleSignOutSubmit}
              color='secondary'>
              Sign Out
            </Button>
          </NavItem>
        </Nav>
        <div className='flex-grow-1 d-flex flex-column'>{ children } </div>
      </div>
    );
  }

  // if user is not authenticated, show sign in and sign up forms
  return (
    <div className='d-flex justify-content-center align-items-center vh-100 vw-100'>
    <Card className='w-50'>
      <CardHeader className='p-2 m-2' tag='h2'>Welcome to MUPP</CardHeader>
      
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
            heading='Welcome Back'
            submitLabel='Sign In'
            onSubmit={handleSignInSubmit}
            validate={services.validateSignIn}
            formFields={
              [
                {
                  name: 'sign-in-email',
                  label: 'Email',
                  type: 'email',
                  
                },
                {
                  name: 'sign-in-password',
                  label: 'Password',
                  type: 'password',
                  
                }
              ]
            }
          />
        </TabPane>
        <TabPane tabId={2}>
          {/* Create Account Form */}
          <AuthForm
            heading='Create an Account'
            submitLabel='Create Account'
            onSubmit={handleSignUpSubmit}
            validate={services.validateSignUp}
            formFields={
              [
                {
                  name: 'sign-up-username',
                  label: 'Username',
                },
                {
                  name: 'sign-up-email',
                  label: 'Email',
                  type: 'email',
                },
                {
                  name: 'sign-up-password',
                  label: 'Password',
                  type: 'password',
                },
                {
                  name: 'sign-up-confirm-password',
                  label: 'Confirm Password',
                  type: 'password',
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