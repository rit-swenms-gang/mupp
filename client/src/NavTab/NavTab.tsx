import { NavItem, NavLink } from "reactstrap";

export interface NavTabProps {
  id: number;
  activeId: number;
  onClick?: (id: number) => void;
  label: string;
}

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