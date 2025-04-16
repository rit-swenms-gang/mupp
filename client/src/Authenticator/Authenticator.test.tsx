import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Authenticator from './Authenticator';

describe.only('Authenticator Component', () => {
  const defaultProps = {
    services: {
      handleSignIn: vi.fn(),
      handleSignOut: vi.fn(),
      handleSignUp: vi.fn(),
      onError: vi.fn(),
      validateSignIn: vi.fn(),
      validateSignUp: vi.fn(),
    }
  };

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const signInFields = {
    email: 'sign-in-email',
    password: 'sign-in-password',
  };

  const signUpFields = {
    username: 'sign-up-username',
    email: 'sign-up-email',
    password: 'sign-up-password',
    confirmPassword: 'sign-up-confirm-password',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Test to ensure that the Authenticator component renders when the user is not authenticated
  it('renders the login and register tabs when the user is not authenticated', () => {
    render(<Authenticator {...defaultProps} />);

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Welcome to MUPP')).toBeInTheDocument();
  });

  // Test to ensure that clicking on a tab switches the view
  it('switches tabs when a tab is clicked', () => {
    render(<Authenticator {...defaultProps} />);

    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByText('Create an Account')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Log In'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // Test to ensure that handleSignIn is called when the login form is submitted
  it('calls handleSignIn when the login form is submitted', async () => {
    const mockHandleSignIn = vi.fn().mockResolvedValue({});
    const services = {
      ...defaultProps.services,
      handleSignIn: mockHandleSignIn,
    };
    render(<Authenticator services={services} />);

    fireEvent.change(screen.getByTestId(signInFields.email), { target: { value: testUser.email } });
    fireEvent.change(screen.getByTestId(signInFields.password), { target: { value: testUser.password } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockHandleSignIn).toHaveBeenCalledTimes(1); 
    });

    const formData = mockHandleSignIn.mock.calls[0][0];
    expect(formData.get(signInFields.email)).toBe(testUser.email);
    expect(formData.get(signInFields.password)).toBe(testUser.password);
  });

  // Test to ensure handleSignUp is called when the register form is submitted
  it('calls handleSignUp when the register form is submitted', async () => {
    const mockHandleSignUp = vi.fn().mockResolvedValue({});
    const services = {
      ...defaultProps.services,
      handleSignUp: mockHandleSignUp,
    };
    render(<Authenticator services={services}/>);

    fireEvent.click(screen.getByText('Register'));
    fireEvent.change(screen.getByTestId(signUpFields.username), { target: { value: testUser.username } });
    fireEvent.change(screen.getByTestId(signUpFields.email), { target: { value: testUser.email } });
    fireEvent.change(screen.getByTestId(signUpFields.password), { target: { value: testUser.password } });
    fireEvent.change(screen.getByTestId(signUpFields.confirmPassword), { target: { value: testUser.password } });
    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockHandleSignUp).toHaveBeenCalledTimes(1);
    });

    const formData = mockHandleSignUp.mock.calls[0][0];
    expect(formData.get(signUpFields.username)).toBe(testUser.username);
    expect(formData.get(signUpFields.email)).toBe(testUser.email);
    expect(formData.get(signUpFields.password)).toBe(testUser.password);
    expect(formData.get(signUpFields.confirmPassword)).toBe(testUser.password);
  });

  // Test to ensure that onError is called when authentication fails
  it('calls onError when authentication fails', async () => {
    const errorMessage = 'Invalid credentials';
    const error = new Error(errorMessage);
    const mockHandleSignIn = vi.fn().mockRejectedValue(error);
    const mockOnError = vi.fn();
    const services = {
      ...defaultProps.services,
      handleSignIn: mockHandleSignIn,
      onError: mockOnError,
    };

    render(<Authenticator services={services} />);

    fireEvent.change(screen.getByTestId(signInFields.email), { target: { value: testUser.email } });
    fireEvent.change(screen.getByTestId(signInFields.password), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockHandleSignIn).toHaveBeenCalledTimes(1);
    });

    expect(mockOnError).toHaveBeenCalledWith(error);
  });

  // Test to ensure that the authenticated view is rendered when the user is authenticated
  it('renders the authenticated view when the user is authenticated', () => {
    localStorage.setItem('isAuthenticated', 'true');
    render(<Authenticator />);

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  // Test to ensure that handleSignOut is called when the sign-out button is clicked
  it('calls handleSignOut when the sign-out button is clicked', async () => {
    const handleSignOutMock = vi.fn().mockResolvedValue({});
    localStorage.setItem('isAuthenticated', 'true');
    const services = {
      ...defaultProps.services,
      handleSignOut: handleSignOutMock,
    };
    render(<Authenticator services={services} />);

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(handleSignOutMock).toHaveBeenCalledTimes(1);
    });
    expect(handleSignOutMock).toHaveBeenCalledTimes(1);

    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });

  // Test to ensure that the validation function is called when the sign-in form is submitted
  it('does not display validation errors for the sign-in form when fields are valid', async () => {
    const mockHandleSignIn = vi.fn().mockResolvedValue({});
    const mockValidateSignIn = vi.fn().mockReturnValue({});
    const services = {
      ...defaultProps.services,
      handleSignIn: mockHandleSignIn,
      validateSignIn: mockValidateSignIn,
    };
  
    render(<Authenticator services={services} />);
  
    // Fill in the form with valid data
    fireEvent.change(screen.getByTestId(signInFields.email), { target: { value: testUser.email } });
    fireEvent.change(screen.getByTestId(signInFields.password), { target: { value: testUser.password } });
  
    fireEvent.click(screen.getByText('Sign In'));
  
    waitFor(() => {
      expect(mockValidateSignIn).toHaveBeenCalledTimes(1);
    });
      
  
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
  });

  // Test to ensure that the validation function displays errors when the sign-in form is submitted with invalid data
  it('displays validation errors for the sign-in form when fields are missing', async () => {
    const mockValidateSignIn = vi.fn().mockReturnValue({
      [signInFields.email]: 'Email is required.',
      [signInFields.password]: 'Password is required.',
    });
    const services = {
      ...defaultProps.services,
      validateSignIn: mockValidateSignIn,
    };
  
    render(<Authenticator services={services} />);
  
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByText('Sign In'));
  
    expect(mockValidateSignIn).toHaveBeenCalledTimes(1);
  
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  // Test to ensure that the validation function is called when the sign-up form is submitted
  it('does not display validation errors for the sign-up form when fields are valid', async () => {
    const mockHandleSignUp = vi.fn().mockResolvedValue({});
    const mockValidateSignUp = vi.fn().mockReturnValue({}); // No validation errors
  
    const services = {
      ...defaultProps.services,
      handleSignUp: mockHandleSignUp,
      validateSignUp: mockValidateSignUp,
    };
  
    render(<Authenticator services={services} />);
  
    // Switch to the Register tab
    fireEvent.click(screen.getByText('Register'));
  
    // Fill in the form with valid data
    fireEvent.change(screen.getByTestId('sign-up-username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByTestId('sign-up-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('sign-up-password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('sign-up-confirm-password'), { target: { value: 'password123' } });
  
    // Submit the form
    fireEvent.click(screen.getByText('Create Account'));
  
    // Assert that validateSignUp was called
    expect(mockValidateSignUp).toHaveBeenCalledTimes(1);
  
    // Assert that no validation errors are displayed
    expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument();
  });

  // Test to ensure that the validation function displays errors when the sign-up form is submitted with invalid data
  it('displays validation errors for the sign-up form when fields are invalid', async () => {
    const mockValidateSignUp = vi.fn().mockReturnValue({
      [signUpFields.username]: 'Username is required.',
      [signUpFields.email]: 'Email is required.',
      [signUpFields.password]: 'Password is required.',
      [signUpFields.confirmPassword]: 'Passwords do not match.',
    });
  
    const services = {
      ...defaultProps.services,
      validateSignUp: mockValidateSignUp,
    };
  
    render(<Authenticator services={services} />);
  
    fireEvent.click(screen.getByText('Register'));
  
    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByTestId(signUpFields.username), { target: { value: '' } });
    fireEvent.change(screen.getByTestId(signUpFields.email), { target: { value: '' } });
    fireEvent.change(screen.getByTestId(signUpFields.password), { target: { value: '' } });
    fireEvent.change(screen.getByTestId(signUpFields.confirmPassword), { target: { value: 'password456' } });
  
    fireEvent.click(screen.getByText('Create Account'));
  
    expect(mockValidateSignUp).toHaveBeenCalledTimes(1);
  
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });
});