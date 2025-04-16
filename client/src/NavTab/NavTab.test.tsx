import { render, screen } from '@testing-library/react';
import NavTab, {NavTabProps} from './NavTab';

describe('NavTab Component', () => {
  const defaultProps: NavTabProps = {
    id: 1,
    activeId: 1,
    onClick: () => {},
    label: 'Tab 1',
  };

  it('renders the label correctly', () => {
    render(<NavTab {...defaultProps}/>);
    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
  });

  it('applies the "active" class when the tab is active', () => {
    render(<NavTab {...defaultProps} />);
    const tab = screen.getByText('Tab 1');
    expect(tab).toHaveClass('active');
  });

  it('does not apply the "active" class when the tab is not active', () => {
    render(<NavTab {...defaultProps} activeId={2} />);
    const tab = screen.getByText('Tab 1');
    expect(tab).not.toHaveClass('active');
  });

  it('sets the correct ARIA attributes', () => {
    render(<NavTab {...defaultProps} />);
    const tab = screen.getByText('Tab 1');
    expect(tab).toHaveAttribute('role', 'button');
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('sets aria-selected to false when the tab is not active', () => {
    render(<NavTab {...defaultProps} activeId={2} />);
    const tab = screen.getByText('Tab 1');
    expect(tab).toHaveAttribute('aria-selected', 'false');
  });
});