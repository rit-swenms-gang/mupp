import { FormEvent, useState } from "react";
import { Button, Card, CardHeader, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { InputType } from "reactstrap/types/lib/Input";
import { printDebugLog } from "../../services/util";

interface AuthFormProps {
  heading?: string;
  submitLabel?: string
  onSubmit?: (data?: FormData) => void;
  formFields?: FormField[]
  validate?: (data: FormData) => Record<string, string>;
};

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
  formFields = [],
  validate = () => ({})
}:AuthFormProps) {

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement)
    const newErrors = validate?.(data);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update errors state
      return; // Stop form submission if there are validation errors
    }

    printDebugLog('Submit Auth Form');
  
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
              invalid={!!errors[field.name]}
            />
            <Label for={field.name}>
              {field.label}
            </Label>
            {errors[field.name] && (
              <FormFeedback>{errors[field.name]}</FormFeedback>
            )}
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