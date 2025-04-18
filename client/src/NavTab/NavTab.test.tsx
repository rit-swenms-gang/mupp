import { fireEvent, render, screen } from '@testing-library/react';
import NavTab, { NavTabProps } from './NavTab';

describe('NavTab Component', () => {
  const defaultProps: NavTabProps = {
    id: 1,
    activeId: 1,
    onClick: vi.fn(),
    label: 'Tab 1',
  };

  // Test to ensure the label is rendered correctly
  it('renders the label correctly', () => {
    render(<NavTab {...defaultProps} />);

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
  });

  // Test to ensure the "active" class is applied when the tab is active
  it('applies the "active" class when the tab is active', () => {
    render(<NavTab {...defaultProps} />);

    const tab = screen.getByText('Tab 1');

    expect(tab).toHaveClass('active');
  });

  // Test to ensure the "active" class is not applied when the tab is not active
  it('does not apply the "active" class when the tab is not active', () => {
    render(<NavTab {...defaultProps} activeId={2} />);

    const tab = screen.getByText('Tab 1');

    expect(tab).not.toHaveClass('active');
  });

  // Test to ensure the onClick handler is called when the tab is clicked
  it('calls the onClick handler when clicked', () => {
    const handleClick = vi.fn(); // Mock function to track calls
    render(<NavTab {...defaultProps} onClick={handleClick} />);

    const tab = screen.getByText('Tab 1');
    fireEvent.click(tab);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(1); // Verify the correct ID is passed
  });

  // Test to ensure the correct ARIA attributes are set when the tab is active
  it('sets the correct ARIA attributes', () => {
    render(<NavTab {...defaultProps} />);

    const tab = screen.getByText('Tab 1');

    expect(tab).toHaveAttribute('role', 'button');
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  // Test to ensure the correct ARIA attributes are set when the tab is not active
  it('sets aria-selected to false when the tab is not active', () => {
    render(<NavTab {...defaultProps} activeId={2} />);

    const tab = screen.getByText('Tab 1');
    
    expect(tab).toHaveAttribute('aria-selected', 'false');
  });
});