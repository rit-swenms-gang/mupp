import { NavItem, NavLink } from "reactstrap";

/**
 * Props for the NavTab component.
 * @param id - The unique identifier for the tab.
 * @param activeId - The ID of the currently active tab.
 * @param onClick - A function to handle tab click events.
 * @param label - The label to display for the tab.
 */
export interface NavTabProps {
  /**
   * The unique identifier for the tab.
   */
  id: number;
  /**
   * The ID of the currently active tab.
   */
  activeId: number;
  /**
   * A function to handle tab click events.
   * It receives the ID of the clicked tab as an argument.
   */
  onClick?: (id: number) => void;
  /**
   * The label to display for the tab.
   */
  label: string;
}

/**
 * Represents a navigation tab component.
 * It displays a clickable tab with a label and handles click events to switch between tabs.
 * @param id - The unique identifier for the tab.
 * @param activeId - The ID of the currently active tab.
 * @param onClick - A function to handle tab click events.
 * @param label - The label to display for the tab.
 */
export default function NavTab({ id, activeId, onClick, label }: NavTabProps) {
  const isActive = id === activeId;

  return (
    <NavItem>
      <NavLink
        tabIndex={id}
        tag='span'
        className={isActive ? 'active' : ''}
        onClick={() => onClick && onClick(id)}
        role='button'
        aria-selected={isActive}
      >
        {label}
      </NavLink>
    </NavItem>
  )
}