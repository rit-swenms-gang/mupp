import { ZodError } from 'zod';

import { createAttributeComponent } from '@coltorapps/builder-react';

import { labelAttribute } from './label-attribute';

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