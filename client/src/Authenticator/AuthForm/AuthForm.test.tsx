import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm, {AuthFormProps} from './AuthForm';

describe('AuthForm Component', () => {
  const defaultProps: AuthFormProps = {
    heading: 'Test Form',
    submitLabel: 'Submit',
    onSubmit: vi.fn(),
    formFields: [
      { name: 'username', label: 'Username', type: 'text', required: false },
      { name: 'password', label: 'Password', type: 'password', required: false },
    ],
    validate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test to ensure the heading is rendered correctly
  it('renders the form with the correct heading and fields', () => {
    render(<AuthForm {...defaultProps} />);
    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  // Test to ensure the form fields are rendered correctly
  it('calls the onSubmit handler with form data when submitted', () => {
    const handleSubmit = vi.fn();
    render(<AuthForm {...defaultProps} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Submit'));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const formData = handleSubmit.mock.calls[0][0];
    expect(formData.get('username')).toBe('testuser');
    expect(formData.get('password')).toBe('password123');
  });

  // Test to ensure the validation function is called
  it('displays validation errors when validation fails', () => {
    const validate = vi.fn(() => ({ username: 'Username is required' }));
    render(<AuthForm {...defaultProps} validate={validate} />);

    fireEvent.click(screen.getByText('Submit'));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  // Test to ensure the validation function is not called if there are no errors
  it('does not call onSubmit if there are validation errors', () => {
    const handleSubmit = vi.fn();
    const validate = vi.fn(() => ({ username: 'Username is required' }));
    render(<AuthForm {...defaultProps} onSubmit={handleSubmit} validate={validate} />);

    // in order to for this to work without updating form fields, all the fields must be non-required
    fireEvent.click(screen.getByText('Submit'));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  // Test to ensure the validation function is not called if there are no errors
  it('renders no validation errors when the form is valid', () => {
    render(<AuthForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Submit'));
    
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });
});