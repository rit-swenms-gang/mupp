import { z } from 'zod';

import { createEntity } from '@coltorapps/builder';

import { labelAttribute, maxValueAttribute, minValueAttribute, requiredAttribute, weightAttribute } from './attributes';

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

/**
 * This entity represents a number scale in a form.
 * It has a label attribute and can be used to create a number input field.
 */
export const numberScaleEntity = createEntity({
  name: 'numberScale',
  attributes: [labelAttribute, weightAttribute, minValueAttribute, maxValueAttribute],
  validate: (value, context) => {
    const min = context.entity.attributes.min ?? 1;
    const max = context.entity.attributes.max ?? 10;

    return z.number()
      .int()
      .nonnegative()
      .min(min)
      .max(max)
      .parse(value);
  },
  attributesExtensions: {
    min: {
      validate(value, context) {
        const minValue = context.validate(value);

        if(minValue >= context.entity.attributes.max) {
          throw new Error('Minimum value must be less than maximum value.');
        }
        return minValue;
      }
    }
  }
});

/**
 * This entity represents a checkbox in a form.
 * It has a label attribute and can be used to create a checkbox input field.
 */
export const checkboxEntity = createEntity({
  name: 'checkbox',
  attributes: [labelAttribute],
  validate: (value) => {
    return z.boolean().parse(value);
  }
});