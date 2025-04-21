import { type Schema } from '@coltorapps/builder';
import { InterpreterEntities, useInterpreterStore } from '@coltorapps/builder-react';

import { NumberScaleEntity, TextFieldEntity } from './Components';
import { formBuilder } from './builder';
import { FormEvent } from 'react';
import { Button, Form } from 'reactstrap';

type FormBuilderSchema = Schema<typeof formBuilder>;

interface FormInterpreterProps {
  schema: FormBuilderSchema;
}

export function FormInterpreter({schema}: FormInterpreterProps) {
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

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
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
       * Alternatively you can use `validationResult.data`
       * instead of sending `FormData`.
      */
      const formData = new FormData(e.currentTarget);
      // const formData = validationResult.data;
      console.log('Form data: ', formData);
    }
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        // fire the submitForm function without gettting return value
        // we only care about the function's side effects
        void submitForm(e);
      }}
    >
      {/*
        * The `InterpreterEntities` component renders the entities tree
        * of the schema of our interpreter store. We pass the entity
        * components for each defined entity type in our form builder
        * (currently, it's only the text field).
      */}
      <InterpreterEntities
        interpreterStore={interpreterStore}
        components={{
          textField: TextFieldEntity, 
          numberScale: NumberScaleEntity
        }}
      />
      <Button type='submit'>Submit</Button>
    </Form>
  );
}