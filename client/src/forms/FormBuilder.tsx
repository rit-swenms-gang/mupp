import { BuilderEntities, BuilderEntityAttributes, useBuilderStore } from '@coltorapps/builder-react';

import { LabelAttribute, TextFieldEntity } from './Components';
import { formBuilder } from './builder';
import { useState } from 'react';

/**
 * A `TextFieldAttributes` component 
 * is responsible for rendering the attributes 
 * of a text field (currently, it only includes the label attribute).
 */
const TextFieldAttribute = () => {
  return (
    <div>
      <LabelAttribute />
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
    // TODO: Will be completed with server integration.
  }

  return (
    <div>
      {/*
        * The `BuilderEntities` component renders the entities
        * tree of the schema of the builder store.
        * Each of the entity components for each defined entity type is passed to
        * the form builder (currently, it's only the text field).
      */}
      <BuilderEntities
        builderStore={builderStore}
        components={{textField: TextFieldEntity}}
      >
        {/*
          * The render prop of the `BuilderEntities` component
          * wraps each rendered arbitrary entity with additional rendering.
        */}
        {(props) => {
          <div>
            {/* Represents each rendered arbitrary entity */}
            {props.children}
            {/* 
              * A button that marks the arbitrary entity as active,
              * allowing the user to edit its attributes.
            */}
            <button
              type='button'
              onClick={() => {setActiveEntityId(props.entity.id)}}
            >
              Select
            </button>
            {/*
              * A delete button is rendered next to each entity
              * that removes the entity from the store's schema.
            */}
            <button
              type='button'
              onClick={() => {builderStore.deleteEntity(props.entity.id)}}
            >
              Delete
              </button>
          </div>
        }}
      </BuilderEntities>

      {/*
        * A button that adds a new text field type entity
        * to the store's schema.
      */}
      <button
        type = 'button'
        onClick={() => builderStore.addEntity({
          type: 'textField',
          attributes: {
            label: 'Text Field',
          },
        })}
      >
        Add Text Field
      </button>

      {/*
      | Only render the `BuilderEntityAttributes` component when
      | an entity is active. Provide the components
      | that render attribute components for each defined
      | entity type in the builder (currently, it's only the
      | text field).
      */}
      {activeEntityId ? (
        <BuilderEntityAttributes
          builderStore={builderStore}
          components={{ textField: TextFieldAttribute }}
          entityId={activeEntityId}
        />
      ) : null}

      {/* TODO: Server integration . */}
      <button type='button' onClick={() => void submitFormSchema()}>
        Save Form
      </button>
    </div>
  );
}