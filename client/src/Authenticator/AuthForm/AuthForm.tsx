import { FormEvent, useState } from "react";
import { Button, Card, CardHeader, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { InputType } from "reactstrap/types/lib/Input";

/**
 * Props for the AuthForm component.
 * @param heading - The heading to display at the top of the form.
 * @param submitLabel - The label for the submit button.
 * @param onSubmit - A function to handle form submission. 
 * @param formFields - The fields to display in the form.
 * @param validate - A function to validate the form data.
 */
export interface AuthFormProps {
  /**
   * The heading to display at the top of the form.
   */
  heading?: string;
  /**
   * The label for the submit button.
   */
  submitLabel?: string
  /**
   * A function to handle form submission.
   * It receives the form data as a FormData object.
   */
  onSubmit?: (data?: FormData) => Promise<void>;
  /**
   * The fields to display in the form.
   * Each field should have a name and label.
   */
  formFields?: FormField[]
  /**
   * A function to validate the form data.
   * It should return an object with field names as keys and error messages as values.
   */
  validate?: (data: FormData) => Record<string, string>;
};

/**
 * Represents a form field in the AuthForm component.
 * @param name - The name of the field, used as the key in FormData.
 * @param label - The label to display for the field.
 * @param type - The type of the field (e.g., text, email, password).
 * @param required - Whether the field is required.
 */
interface FormField {
  /**
   * The name of the field, used as the key in FormData.
   */
  name: string;
  /**
   * The label to display for the field.
   */
  label: string;
  /**
   * The type of the field (e.g., text, email, password).
   */
  type?: InputType;
  /**
   * Whether the field is required.
   * TODO: Change to check in validate (along with field names)
   */
  required?: boolean;
}

/**
 * Represents an authentication form.
 * It allows users to enter their credentials and submit the form.
 * @param param0 - The props for the AuthForm component.
 * @param param0.heading - The heading to display at the top of the form.
 * @param param0.submitLabel - The label for the submit button.
 * @param param0.onSubmit - A function to handle form submission.
 * @param param0.formFields - The fields to display in the form.
 * @param param0.validate - A function to validate the form data.
 */
export default function AuthForm({
  heading = "Form Heading", 
  submitLabel = "Submit Form",
  onSubmit = () => {return Promise.resolve()}, 
  formFields = [],
  validate = () => ({})
}:Readonly<AuthFormProps>) {

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles form submission.
   * @param event - The form submission event.
   * @returns A promise that resolves when the form is submitted.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement)
    const newErrors = validate?.(data) ?? {};

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update errors state
      return;
    }

    // handle data on Authenticator
    onSubmit?.(data);

  }

  return (
    <Card>
      <CardHeader tag='h2'>{heading}</CardHeader>

      {/* Form fields */}
      <Form onSubmit={handleSubmit}>
        {formFields?.map((field) =>
          <FormGroup key={field.name} floating>
            <Input
              id={field.name}
              name={field.name}
              placeholder={field.label}
              type={field?.type}
              invalid={!!errors[field.name]}
              data-testid={field.name}
            />
            <Label for={field.name}>
              {field.label}
            </Label>
            {errors[field.name] && (
              <FormFeedback>{errors[field.name]}</FormFeedback>
            )}
          </FormGroup>
        )}
        
        {/* Submit form button */}
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