import { FormInterpreter } from './FormInterpreter';

export default function FormPage() {
  // TODO: retrieve form schema from the server
  // i.e. const form = await fetch('localhost:5001/forms-endpoint', { method: 'GET' })
  // the endpoint must return a JSON object with a similar structure to the mocked one below

  // THIS IS A MOCKED SCHEMA
  const mockSchema = {
    entities: {
      '51324b32-adc3-4d17-a90e-66b5453935bd': {
        type: 'boolean' as const,
        'attributes': {
          label: 'Are you a leader?',
          required: true
        }
      },
      '7a77959a-eb84-447c-9ed7-200e2a674eea': {
        type: 'textField' as const,
        attributes: {
          label: 'Name',
          required: true
        },
        
      },
      '7a49f550-5966-4c8c-89eb-a0797940fff3': {
        type: 'numberScale' as const,
        attributes: {
          label: 'Age',
          weight: 1,
          min: 1,
          max: 100
        },
        
      }
    },
    root: [
      '51324b32-adc3-4d17-a90e-66b5453935bd', 
      '7a77959a-eb84-447c-9ed7-200e2a674eea', 
      '7a49f550-5966-4c8c-89eb-a0797940fff3'
    ]
  };

  return <FormInterpreter schema={mockSchema} />;
}