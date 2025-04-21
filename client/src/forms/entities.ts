import { z } from 'zod';

import { createEntity } from '@coltorapps/builder';

import { labelAttribute, requiredAttribute } from './attributes';

// Think of entities with attributes as components with props. 
// For example, you can define a text field entity, and users can later add multiple instances of text fields to a form.

/**
 * This entity represents a text field in a form.
 * It has a label attribute and can be used to create a text input field.
 */
export const textFieldEntity = createEntity({
  name: 'textField',
  attributes: [labelAttribute, requiredAttribute], // like a prop to the entity
  validate: (value, context) => {
    const schema = z.string();

    if(!context.entity.attributes.required) {
      return schema.optional().parse(value);
    }

    return schema.parse(value);
  }
    
});

export const numberScaleEntity = createEntity({
  name: 'numberScale',
  attributes: [labelAttribute, requiredAttribute],
  validate: (value, context) => {
    const schema = z.number().min(0).max(10);

    if(!context.entity.attributes.required) {
      return schema.optional().parse(value);
    }

    return schema.parse(value);
  }
});
