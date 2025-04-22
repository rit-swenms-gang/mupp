import { useParams } from 'react-router';
import { FormInterpreter } from './FormInterpreter';
import { useEffect, useState } from 'react';
import { Spinner } from 'reactstrap';

export default function FormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formSchema, setFormSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        const response = await fetch(`http://localhost:5001/form/${formId}`, { method: 'GET' });

        if (!response.ok) {
          throw new Error(`Error fetching form: ${response.statusText}`);
        }

        const schema = await response.json();
        setFormSchema(schema.form_structure);
        setLoading(false);
      } catch (error) {
        const err = error as Error;
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFormSchema();
  }, [formId]); // Re-run the effect if formId changes

  if (loading) {
    return <>
      <div className='d-flex flex-column align-items-center'>
        <Spinner color='secondary'>Loading the form...</Spinner>
        <p>Loading your form...</p>
      </div>
      
      </>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (submitted) {
    return <div>
      Form submitted successfully! You can now close this tab.
    </div>;
  }

  // THIS IS A MOCKED SCHEMA
  // const mockSchema = {
  //   entities: {
  //     '51324b32-adc3-4d17-a90e-66b5453935bd': {
  //       type: 'isLeader' as const,
  //       'attributes': {
  //         label: 'Are you a leader?',
  //         defaultValue: false
  //       }
  //     },
  //     '7a77959a-eb84-447c-9ed7-200e2a674eea': {
  //       type: 'textField' as const,
  //       attributes: {
  //         label: 'Name',
  //         required: true
  //       },
        
  //     },
  //     '7a49f550-5966-4c8c-89eb-a0797940fff3': {
  //       type: 'numberScale' as const,
  //       attributes: {
  //         label: 'Age',
  //         weight: 1,
  //         min: 1,
  //         max: 100,
  //         defaultValue: 50
  //       },
        
  //     }
  //   },
  //   root: [
  //     '51324b32-adc3-4d17-a90e-66b5453935bd', 
  //     '7a77959a-eb84-447c-9ed7-200e2a674eea', 
  //     '7a49f550-5966-4c8c-89eb-a0797940fff3'
  //   ]
  // };

  return <FormInterpreter schema={formSchema} formId={formId} onSubmit={() => setSubmitted(true)} />;
}