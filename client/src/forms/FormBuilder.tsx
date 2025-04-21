import { BuilderEntities, BuilderEntityAttributes, useBuilderStore } from '@coltorapps/builder-react';

import { BooleanEntity, LabelAttribute, MaxNumberAttribute, MinNumberAttribute, NumberScaleEntity, RequiredAttribute, TextFieldEntity, WeightAttribute } from './Components';
import { formBuilder } from './builder';
import { Button, Card, CardBody, CardHeader, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';

const LabelRequiredSection = () => {
  return (
    <div className='d-flex justify-content-between'>
      <div className='flex-grow-1 me-4'>
        <LabelAttribute />
      </div>
      <RequiredAttribute />
    </div>
  )
}

/**
 * A `TextFieldAttributes` component 
 * is responsible for rendering the attributes 
 * of a text field (currently, it only includes the label attribute).
 */
const TextFieldAttribute = () => {
  return (
    <>
      <LabelRequiredSection />
    </>
  )
}

/**
 * A `NumberScaleAttributes` component 
 * is responsible for rendering the attributes 
 * of a number scale (the label, weight, min, and max attributes).
 */
const NumberScaleAttribute = () => {
  return (
    <>
      <LabelAttribute />
      <WeightAttribute />
      <div className='d-flex justify-content-between'>
        <MinNumberAttribute />
        <MaxNumberAttribute />
      </div>
    </>
  )
}

const BooleanAttribute = () => {
  return (
    <>
      <LabelRequiredSection />  
    </>
  )
}

/**
 * The `FormBuilderPage` component is a form builder page that allows users to create forms using a schema builder.
 * It provides a user interface for adding, editing, and deleting form fields and their attributes.
 */
export default function FormBuilderPage() {
  /**
   * The `useBuilderStore` hook creates a builder store. 
   * This store is responsible for building a schema based on a builder definition.
   */
  const builderStore = useBuilderStore(formBuilder, {
    initialData: {
      schema: {
       entities: {
          '51324b32-adc3-4d17-a90e-66b5453935bd': {
            type: 'boolean',
            attributes: {
              label: 'Are you a leader?',
              required: true,
              defaultValue: false,
            }
          }
        },
        root: ['51324b32-adc3-4d17-a90e-66b5453935bd']
      },
    },
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

      // check if schema is empty
      if(Object.keys(validationResult.data.entities).length <= 1) {
        alert('Please add at least one entity to the form.');
        return;
      }

      // TODO: save form in the server 
      // (i.e. fetch('localhost:5001/forms-endpoint', { method: 'POST', body: JSON.stringify(validationResult.data) }))
      // the endpoint will have to validate the incoming schema based on the builder used to create it.
      // a python library like `jsonschema` or `pydantic` can be used to validate the schema.
      // It should return a 200 status code if the schema is valid and save the form in the DB.
      // If the schema is invalid send back a 400 code and do not save.
      
      // validationResult.data; // This is the form's schema
      console.log('Form schema is valid: ', validationResult.data);
    } else {
      console.error('Form schema is invalid: ', validationResult.reason);
      alert('Please correct the errors in the form before saving it.');
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
        * the form builder.
      */}
      <BuilderEntities
        builderStore={builderStore}
        components={{ 
          textField: TextFieldEntity,
          numberScale: NumberScaleEntity,
          boolean: BooleanEntity,
        }}
      >
        {/*
          * The render prop of the `BuilderEntities` component
          * wraps each rendered arbitrary entity with additional rendering.
        */}
        {(props) => {
          return (
            <Card>
              <CardBody>
                {/* Render the BuilderEntityAttributes input field */}
                <BuilderEntityAttributes
                  builderStore={builderStore}
                  components={{ 
                    textField: TextFieldAttribute,
                    numberScale: NumberScaleAttribute,
                    boolean: BooleanAttribute,
                  }}
                  entityId={props.entity.id}
                />

                {/* Represents each rendered arbitrary entity */}
                {props.children}

                {/* A delete button is rendered next to each entity that removes the entity from the store's schema. */}
                <Button
                  type='button'
                  color='danger'
                  onClick={() => {
                    builderStore.deleteEntity(props.entity.id);
                  }}
                  hidden={props.entity.id === builderStore.getSchema().root[0]}
                >
                  Delete
                </Button>
              </CardBody>
            </Card>
          );
        }}
      </BuilderEntities>

      {/*
        * A button that adds a new entity to the store's schema.
      */}
      <div 
        className='d-flex justify-content-end'
        style={{ gap: '1rem' }}
      >
        <UncontrolledDropdown>
          <DropdownToggle caret>
            Add
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              onClick={() => builderStore.addEntity({
                type: 'textField',
                attributes: {
                  label: '',
                },
              })}
            >
              Text Field
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              onClick={() => builderStore.addEntity({
                type: 'numberScale',
                attributes: {
                  label: '',
                  weight: 0,
                  min: 1,
                  max: 10,
                  defaultValue: 5,
                },
              })}
            >
              Number Scale
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              onClick={() => builderStore.addEntity({
                type: 'boolean',
                attributes: {
                  label: '',
                  required: false,
                  defaultValue: false,
                },
              })}
            >
              Boolean (Checkbox)
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>

        <Button 
          type='button' 
          onClick={() => void submitFormSchema()}
          color='success'
        >
          Save Form
        </Button>
      </div>
      
      </CardBody>
    </Card>
  );
}