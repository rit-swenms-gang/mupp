import { type Schema } from '@coltorapps/builder';
import { InterpreterEntities, useInterpreterStore } from '@coltorapps/builder-react';

import { BooleanEntity, IsLeaderEntity, NumberScaleEntity, TextFieldEntity } from './Components';
import { formBuilder } from './builder';
import { Button, Card, CardBody, Form } from 'reactstrap';

type FormBuilderSchema = Schema<typeof formBuilder>;

interface FormInterpreterProps {
  schema: FormBuilderSchema;
  formId: string;
  onSubmit?: () => void;
}

export function FormInterpreter({schema, formId, onSubmit}: Readonly<FormInterpreterProps>) {
  /*
   * The `useInterpreterStore` hook creates an interpreter store for us. 
   * This store is used for filling entities values based on a schema and builder definition.
  */
  const interpreterStore = useInterpreterStore(formBuilder, schema, {
    events: {
      /*
       * The `onEntityValueUpdated` event callback triggers an arbitrary entity 
       * validation every time its value is updated.
      */
      onEntityValueUpdated(payload) {
        void interpreterStore.validateEntityValue(payload.entityId);
      },
    },
  });

  const submitForm = async () => {
    // TODO: server integration to save the form
    /*
     * Validate the values once again on the client
     * to trigger all the validations and provide the user
     * with feedback on what needs to be corrected.
    */
    const validationResult = await interpreterStore.validateEntitiesValues();

    if(validationResult.success) {
      /*
       * The schema is valid and can be sent to the server.
      */
      const formData = validationResult.data;
      console.log('Form data: ', formData);

      try{
        await fetch(`http://localhost:5001/form/${formId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        onSubmit?.();
      } catch (error) {
        console.error('Error while saving the form: ', error);
        alert('An error occurred while saving the form. Please try again later.');
      }

      

    } else {
      console.error('Form data is invalid: ', validationResult.entitiesErrors);
      alert('Please correct the errors in the form before saving it.');
    }
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        // fire the submitForm function without gettting return value
        // we only care about the function's side effects
        void submitForm();
      }}
    >
      
      {/*
        * The `InterpreterEntities` component renders the entities tree
        * of the schema of our interpreter store. We pass the entity
        * components for each defined entity type in our form builder.
      */}
      <InterpreterEntities
        interpreterStore={interpreterStore}
        components={{
          boolean: BooleanEntity,
          isLeader: IsLeaderEntity,
          numberScale: NumberScaleEntity,
          textField: TextFieldEntity, 
        }}
      >
        {(props) => {
          return (
            <Card>
              <CardBody>
                {/* Render the BuilderEntityAttributes input field */}
                <div className="entity-header">
                  {props.entity.type === 'textField' && 'Text Field'}
                  {props.entity.type === 'numberScale' && 'Number Scale'}
                  {props.entity.type === 'boolean' && 'Checkbox'}
                </div>
            
                {/* Represents each rendered arbitrary entity */}
                {props.children}
              </CardBody>
            </Card>
          );
        }}

      </InterpreterEntities>
      <Button type='submit'>Submit</Button>
    </Form>
  );
}