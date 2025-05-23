import { BuilderEntities, BuilderEntityAttributes, useBuilderStore } from '@coltorapps/builder-react';

import { BooleanEntity, IsLeaderEntity, LabelAttribute, MaxNumberAttribute, MinNumberAttribute, NumberScaleEntity, RequiredAttribute, TextFieldEntity, WeightAttribute } from './Components';
import { formBuilder } from './builder';
import { Button, Card, CardBody, CardHeader, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { getCookies } from '../services/auth';

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
    <LabelRequiredSection />
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
    <LabelRequiredSection />  
  )
}

const IsLeaderAttribute = () => {
  return (<></>);
}

/**
 * The `FormBuilderPage` component is a form builder page that allows users to create forms using a schema builder.
 * It provides a user interface for adding, editing, and deleting form fields and their attributes.
 */
export default function FormBuilderPage({ onFormSaved }: Readonly<{ onFormSaved?: () => void }>) {
  
  /**
   * The `useBuilderStore` hook creates a builder store. 
   * This store is responsible for building a schema based on a builder definition.
   */
  const builderStore = useBuilderStore(formBuilder, {
    // provide a default entity that is present on every form
    initialData: {
      schema: {
       entities: {
          '51324b32-adc3-4d17-a90e-66b5453935bd': {
            type: 'isLeader',
            attributes: {
              label: 'Are you a leader?',
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
    const validationResult = await builderStore.validateSchema();
  
    if (validationResult.success) {
      if (Object.keys(validationResult.data.entities).length <= 1) {
        alert('Please add at least one entity to the form.');
        return 400;
      }

      const cookies = getCookies();
  
      try {
        const res = await fetch('http://localhost:5001/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Session-Key': cookies.session || '' 
          },
          body: JSON.stringify({
            form_structure: validationResult.data
          })
        });
  
        if (res.ok) {
          const data = await res.json();
          alert(`Form saved! ID: ${data.form_endpoint}`);
          onFormSaved?.();
        } else {
          const err = await res.json();
          alert(`Error: ${err.message}`);
        }
      } catch (err) {
        console.error('Error posting form:', err);
        alert('Network error while saving form.');
      }
    } else {
      alert('Please fix errors in the form before saving.');
    }
  };

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
          boolean: BooleanEntity,
          isLeader: IsLeaderEntity,
          numberScale: NumberScaleEntity,
          textField: TextFieldEntity,
        }}
      >
        {/*
          * The render prop of the `BuilderEntities` component
          * wraps each rendered arbitrary entity with additional rendering.
        */}
        {(props) => {
          return (
            <Card className="entity-card">
            <CardBody>
              {/* Render the BuilderEntityAttributes input field */}
              <div className="entity-header">
                {props.entity.type === 'textField' && 'Text Field'}
                {props.entity.type === 'numberScale' && 'Number Scale'}
                {props.entity.type === 'boolean' && 'Checkbox'}
              </div>
      
              <div className="entity-section">
                <BuilderEntityAttributes
                  builderStore={builderStore}
                  components={{ 
                    boolean: BooleanAttribute,
                    isLeader: IsLeaderAttribute,
                    numberScale: NumberScaleAttribute,
                    textField: TextFieldAttribute,
                  }}
                  entityId={props.entity.id}
                />
              </div>
      
              {/* Represents each rendered arbitrary entity */}
              {props.children}
      
              {/* A delete button is rendered next to each entity that removes the entity from the store's schema. */}
              <Button
                type='button'
                color='danger'
                className="btn-delete"
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