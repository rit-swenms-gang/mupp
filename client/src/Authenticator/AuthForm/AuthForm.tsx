import { FormEvent } from "react";
import { Button, Card, CardHeader, Form, FormGroup, Input, Label } from "reactstrap";
import { InputType } from "reactstrap/types/lib/Input";

interface AuthFormProps {
  heading?: string;
  submitLabel?: string
  onSubmit?: (data?: FormData) => void;
  formFields?: FormField[]
};

// TODO: add validation callback for each field, determine form feedback
interface FormField {
  name: string;
  label: string;
  type?: InputType;
  required?: boolean;
}

export default function AuthForm({
  heading = "Form Heading", 
  submitLabel = "Submit Form",
  onSubmit = () => {}, 
  formFields = []
}:AuthFormProps) {

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement)

    console.log('Submit Auth Form');
  
    // handle data on Authenticator
    onSubmit?.(data);
  }

  return (
    <Card>
      <CardHeader tag='h2'>{heading}</CardHeader>
      <Form onSubmit={handleSubmit}>
        {formFields?.map((field, index) =>
          <FormGroup key={index} floating>
            <Input
              id={field.name}
              name={field.name}
              placeholder={field.label}
              type={field?.type}
              required={field.required}
            />
            <Label for={field.name}>
              {field.label}
            </Label>
          </FormGroup>
        )}
        
        <FormGroup className='py-3'>
          <Button
            block
            type='submit'
          >
            {submitLabel}
          </Button>
        </FormGroup>
      </Form>
    </Card>
  );
}