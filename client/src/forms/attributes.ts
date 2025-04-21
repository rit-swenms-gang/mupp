import { z } from 'zod';

import { createAttribute } from '@coltorapps/builder';

// Think of attributes as the props of your entities. 
// For instance, a text field may include attributes such as a label, a requirement flag, a maximum length, and others. 
// Attributes are atomic, enabling their reuse across various entities.

/**
 * This attribute is used to set the label of a form field.
 * It must be a non-empty string.
 */
export const labelAttribute = createAttribute({
  name: 'label',
  validate: (value) => z.string().min(1).parse(value)
});

/**
 * This attribute is used to set whether a form field is required or not.
 */
export const requiredAttribute = createAttribute({
  name: 'required',
  validate: (value) => z.boolean().optional().parse(value)
});

/**
 * This attribute is used to set the maximum value of a form field.
 * It must be a non-negative integer.
 */
export const minValueAttribute = createAttribute({
  name: 'min',
  validate: (value) => z.number().int().nonnegative().parse(value)
});

/**
 * This attribute is used to set the maximum value of a form field.
 * It must be a non-negative integer.
 */
export const maxValueAttribute = createAttribute({
  name: 'max',
  validate: (value) => z.number().int().nonnegative().parse(value)
});

/**
 * This attribute is used to set the weight of a form field.
 * It must be a non-negative integer between 1 and 5.
 */
export const weightAttribute = createAttribute({
  name: 'weight',
  validate: (value) => z.number().int().min(1).max(5).parse(value)
});

/**
 * This attribute is used to set the default value of a form field.
 * It can be any value, including null or undefined.
 */
export const defaultValueAttribute = createAttribute({
  name: 'defaultValue',
  validate: (value) => z.any().optional().parse(value)
});