import { ZodError } from 'zod';

import { createAttributeComponent, createEntityComponent } from '@coltorapps/builder-react';

import { labelAttribute, maxNumberAttribute, minNumberAttribute, requiredAttribute } from './attributes';
import { textFieldEntity } from './entities';
import { Input, Label } from 'reactstrap';

/**
 * This component renders a label attribute for a form field.
 * It is used to create a label input field for the user to enter the label text.
 */
export const LabelAttribute = createAttributeComponent(
  labelAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <Input
          id={id}
          name={id}
          value={props.attribute.value ?? ''}
          // update value of the entity
          onChange={(e) => props.setValue(e.target.value)}
          required
          placeholder='Question label'
        />
        {/* Catch errors from Zod validation and render them */}
        {props.attribute.error instanceof ZodError
          ? props.attribute.error.format()._errors[0]
          : null}
      </div>
    );
  }
);

/**
 * This component renders a required attribute for a form field.
 * It is used to create a checkbox input field for the user to set the required flag.
 */
export const RequiredAttribute = createAttributeComponent(
  requiredAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <Label htmlFor={id}>
          <Input
            id={id}
            name={id}
            type="checkbox"
            checked={props.attribute.value ?? false}
            onChange={(e) => props.setValue(e.target.checked)}
          />
          Required
        </Label>
        {props.attribute.error instanceof ZodError
          ? props.attribute.error.format()._errors[0]
          : null}
      </div>
    );
  }
);

export const MinNumberAttribute = createAttributeComponent(
  minNumberAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <Input
          id={id}
          name={id}
          type='number'
          value={props.attribute.value ?? ''}
          onChange={(e) => props.setValue(Number(e.target.value))}
          placeholder='0'
        />
        {props.attribute.error instanceof ZodError
          ? props.attribute.error.format()._errors[0]
          : null}
      </div>
    );
  }
);

export const MaxNumberAttribute = createAttributeComponent(
  maxNumberAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <Input
          id={id}
          name={id}
          type='number'
          value={props.attribute.value ?? ''}
          onChange={(e) => props.setValue(Number(e.target.value))}
          placeholder='10'
        />
        {props.attribute.error instanceof ZodError
          ? props.attribute.error.format()._errors[0]
          : null}
      </div>
    );
  }
);

/**
 * This component renders a text field entity for a form.
 * It is used to create a text input field with a label for the user to enter text.
 */
export const TextFieldEntity = createEntityComponent(
  textFieldEntity,
  (props) => {

    return (
      <div>
        <Input
          id={props.entity.id}
          name={props.entity.id}
          value={props.entity.value ?? ''}
          onChange={(e) => props.setValue(e.target.value)}
          placeholder='Answer goes here...'
        />
        {props.entity.error instanceof ZodError
          ? props.entity.error.format()._errors[0]
          : null}
      </div>
    )
  },
);