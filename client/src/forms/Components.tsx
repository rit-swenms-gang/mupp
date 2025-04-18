import { ZodError } from 'zod';

import { createAttributeComponent, createEntityComponent } from '@coltorapps/builder-react';

import { labelAttribute } from './attributes';
import { textFieldEntity } from './entities';

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
        <label htmlFor={id}>Field Label</label>
        <input
          id={id}
          name={id}
          value={props.attribute.value ?? ""}
          // update value of the entity
          onChange={(e) => props.setValue(e.target.value)}
          required
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
 * This component renders a text field entity for a form.
 * It is used to create a text input field with a label for the user to enter text.
 */
export const TextFieldEntity = createEntityComponent(
  textFieldEntity,
  (props) => {
    return (
      <div>
        <label htmlFor={props.entity.id}>
          {props.entity.attributes.label}
        </label>
        <input
          id={props.entity.id}
          name={props.entity.id}
          value={props.entity.value ?? ""}
          onChange={(e) => props.setValue(e.target.value)}
        />
        {props.entity.error instanceof ZodError
          ? props.entity.error.format()._errors[0]
          : null}
      </div>
    )
  },
);