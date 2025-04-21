import { BuilderEntities, BuilderEntityAttributes, useBuilderStore } from '@coltorapps/builder-react';

import { LabelAttribute, RequiredAttribute, TextFieldEntity } from './Components';
import { formBuilder } from './builder';
import { useState } from 'react';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';

/**
 * A `TextFieldAttributes` component 
 * is responsible for rendering the attributes 
 * of a text field (currently, it only includes the label attribute).
 */
const TextFieldAttribute = () => {
  return (
    <div className='d-flex justify-content-between'>
      <div className='flex-grow-1 me-4'>
        <LabelAttribute />
      </div>
      <RequiredAttribute />
    </div>
  )
}

export default function FormBuilderPage() {
  /**
   * The `activeEntityId` state variable holds an optional reference to the currently active entity ID.
   */
  const [activeEntityId, setActiveEntityId] = useState<string>();

  /**
   * The `useBuilderStore` hook creates a builder store. 
   * This store is responsible for building a schema based on a builder definition.
   */
  const builderStore = useBuilderStore(formBuilder, {
    events: {
      /*
       * We use the `onEntityAttributeUpdated` event callback
       * to trigger an arbitrary attribute validation every time
       * its value is updated.
       */
      onEntityAttributeUpdated(payload) {
        void builderStore.validateEntityAttribute(
          payload.entity.id,
          payload.attributeName
        );
      },

      /*
       * We use the `onEntityDeleted` event callback to unset the
       * `activeEntityId` state variable when the currently active
       * entity is deleted.
       */
      onEntityDeleted(payload) {
        if(payload.entity.id === activeEntityId) {
          setActiveEntityId(undefined);
        }
      },
    },
  });

  const submitFormSchema = async () => {
    /*
     * Validate the schema once again on the client
     * to trigger all the validations and provide the user
     * with feedback on what needs to be corrected.
     */
    const validationResult = await builderStore.validateSchema();

    if(validationResult.success) {
      // TODO: save form in the server 
      // (i.e. fetch('localhost:5001/forms-endpoint', { method: 'POST', body: JSON.stringify(validationResult.data) }))
      // the endpoint will have to validate the incoming schema based on the builder used to create it.
      // a python library like `jsonschema` or `pydantic` can be used to validate the schema.
      // It should return a 200 status code if the schema is valid and save the form in the DB.
      // If the schema is invalid send back a 400 code and do not save.
      
      // validationResult.data; // This is the form's schema
      console.log('Form schema is valid: ', validationResult.data);
    }
  }

  return (
    <Card>
      <CardHeader tag='h2'>Form Builder</CardHeader>
      <CardBody>
      {/*
        * The `BuilderEntities` component renders the entities
        * tree of the schema of the builder store.
        * Each of the entity components for each defined entity type is passed to
        * the form builder (currently, it's only the text field).
      */}
      <BuilderEntities
        builderStore={builderStore}
        components={{ textField: TextFieldEntity }}
      >
        {/*
          * The render prop of the `BuilderEntities` component
          * wraps each rendered arbitrary entity with additional rendering.
        */}
        {(props) => {
          return (
            <Card>
              <CardBody>
                {/* Render the BuilderEntityAttributes input field if the entity is selected */}
                {/* {activeEntityId === props.entity.id && (
                  
                )} */}
                <BuilderEntityAttributes
                  builderStore={builderStore}
                  components={{ textField: TextFieldAttribute }}
                  entityId={props.entity.id}
                />

                {/* Represents each rendered arbitrary entity */}
                {props.children}

                {/* A button that marks the arbitrary entity as active, allowing the user to edit its attributes. */}
                {/* <Button
                  type='button'
                  color='secondary'
                  onClick={() => {
                    setActiveEntityId(props.entity.id);
                  }}
                >
                  Select
                </Button> */}

                {/* A delete button is rendered next to each entity that removes the entity from the store's schema. */}
                <Button
                  type='button'
                  color='danger'
                  onClick={() => {
                    builderStore.deleteEntity(props.entity.id);
                  }}
                >
                  Delete
                </Button>
              </CardBody>
            </Card>
          );
        }}
      </BuilderEntities>

      {/*
        * A button that adds a new text field type entity
        * to the store's schema.
      */}
      <Button
        type = 'button'
        color = 'primary'
        onClick={() => builderStore.addEntity({
          type: 'textField',
          attributes: {
            label: '',
          },
        })}
      >
        Add Text Field
      </Button>
      
      <Button 
        type='button' 
        onClick={() => void submitFormSchema()}
        color='success'
      >
        Save Form
      </Button>
      </CardBody>
    </Card>
  );
}