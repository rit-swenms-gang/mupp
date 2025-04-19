import { FormInterpreter } from "./FormInterpreter";

export default async function FormPage() {
  // TODO: retrieve form schema from the server
  // i.e. const form = await fetch('localhost:5001/forms-endpoint', { method: 'GET' })
  // the endpoint must return a JSON object with a similar structure to the mocked one below

  // THIS IS A MOCKED SCHEMA
  const mockSchema = {
    entities: {
      "entity1": {
        type: "textField" as const,
        attributes: {
          label: "Name"
        },
        parentId: undefined
      },
      "entity2": {
        type: "textField" as const,
        attributes: {
          label: "Email"
        },
        parentId: "entity1"
      }
    },
    root: ["entity1"]
  };

  return <FormInterpreter schema={mockSchema} />;
}