import { z } from 'zod';

import { createEntity } from '@coltorapps/builder';

import { defaultValueAttribute, labelAttribute, maxValueAttribute, minValueAttribute, requiredAttribute, weightAttribute } from './attributes';

// Think of entities with attributes as components with props. 
// For example, you can define a text field entity, and users can later add multiple instances of text fields to a form.

/**
 * This entity represents a text field in a form.
 * It has a label attribute and can be used to create a text input field.
 */
export const textFieldEntity = createEntity({
  name: 'textField',
  attributes: [labelAttribute, requiredAttribute, defaultValueAttribute], // like a prop to the entity
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
  attributes: [labelAttribute, weightAttribute, minValueAttribute, maxValueAttribute, defaultValueAttribute],
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
  defaultValue(context) {
    const min = context.entity.attributes.min ?? 0;
    const max = context.entity.attributes.max ?? 10;

    // Return the default value or the midpoint of min and max
    return context.entity.attributes.defaultValue ?? (Math.floor((min + max) / 2) + min);
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
export const booleanEntity = createEntity({
  name: 'boolean',
  attributes: [labelAttribute, requiredAttribute, defaultValueAttribute],
  validate: (value, context) => {
    const schema = z.boolean();

    if(!context.entity.attributes.required) {
      return schema.optional().parse(value);
    }

    return schema.parse(value);
  },
  defaultValue(context) {
    return context.entity.attributes.defaultValue ?? false;
  },
});