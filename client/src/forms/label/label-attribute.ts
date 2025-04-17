import { z } from "zod";

import { createAttribute } from "@coltorapps/builder";

// Think of attributes as the props of your entities. 
// For instance, a text field may include attributes such as a label, a requirement flag, a maximum length, and others. 
// Attributes are atomic, enabling their reuse across various entities.

/**
 * This attribute is used to set the label of a form field.
 * It must be a non-empty string.
 */
export const labelAttribute = createAttribute({
  name: "label",
  validate: (value) => z.string().min(1).parse(value)
});