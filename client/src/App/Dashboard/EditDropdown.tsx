import { useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

type EditDropdownProps = {
	formId: any;
	editAction: (arg0: any) => void;
	deleteAction: (arg0: any) => void;
  };

export default function EditDropdown({formId, editAction, deleteAction}: Readonly<EditDropdownProps>) {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
	
	return (
		<Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
			<DropdownToggle caret>...</DropdownToggle>
			<DropdownMenu>
				<DropdownItem onClick={() => editAction(formId)}>Edit</DropdownItem>
				<DropdownItem onClick={() => deleteAction(formId)}>Delete</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}