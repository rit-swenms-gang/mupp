import { ZodError } from 'zod';

import { createAttributeComponent, createEntityComponent } from '@coltorapps/builder-react';

import { labelAttribute, maxValueAttribute, minValueAttribute, requiredAttribute, weightAttribute } from './attributes';
import { checkboxEntity, numberScaleEntity, textFieldEntity } from './entities';
import { Input, Label } from 'reactstrap';

import './Components.css';

interface ZodErrorMessageProps {
  error: unknown; // The error object to check
}

const ZodErrorMessage: React.FC<ZodErrorMessageProps> = ({ error }) => {
  if (error instanceof ZodError) {
    const errorMessage = error.format()._errors[0];
    return <p className="text-danger mt-2">{errorMessage}</p>;
  }
  return null; // No error to display
};

/**
 * This component renders a label attribute for a form field.
 * It is used to create a label input field for the user to enter the label text.
 */
export const LabelAttribute = createAttributeComponent(
  labelAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <Input
          id={id}
          name={id}
          value={props.attribute.value ?? ''}
          // update value of the entity
          onChange={(e) => props.setValue(e.target.value)}
          required
          placeholder='Question label'
        />
        {/* Catch errors from Zod validation and render them */}
        <ZodErrorMessage error={props.attribute.error} />
      </div>
    );
  }
);

/**
 * This component renders a required attribute for a form field.
 * It is used to create a checkbox input field for the user to set the required flag.
 */
export const RequiredAttribute = createAttributeComponent(
  requiredAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div className='input-container'>
        <Input
          id={id}
          name={id}
          type="checkbox"
          checked={props.attribute.value ?? false}
          onChange={(e) => props.setValue(e.target.checked)}
        />
        <Label htmlFor={id}>
          Required?
        </Label>
        <ZodErrorMessage error={props.attribute.error} />
      </div>
    );
  }
);

/**
 * This component renders a min number attribute for a form field.
 * It is used to create a number input field for the user to enter the minimum value.
 */
export const MinNumberAttribute = createAttributeComponent(
  minValueAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <div className='input-container'>
          <Label htmlFor={id}>
            Min
          </Label>
          <Input
            id={id}
            name={id}
            type='number'
            value={props.attribute.value ?? ''}
            onChange={(e) => props.setValue(Number(e.target.value))}
            className='number-input'
          />
        </div>
        <ZodErrorMessage error={props.attribute.error} />
      </div>
    );
  }
);

/**
 * This component renders a max number attribute for a form field.
 * It is used to create a number input field for the user to enter the maximum value.
 */
export const MaxNumberAttribute = createAttributeComponent(
  maxValueAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div>
        <div className='input-container'>
          <Label htmlFor={id}>
            Max
          </Label>
          <Input
            id={id}
            name={id}
            type='number'
            value={props.attribute.value ?? ''}
            onChange={(e) => props.setValue(Number(e.target.value))}
            className='number-input'
          />
        </div>
        <ZodErrorMessage error={props.attribute.error} />
      </div>
    );
  }
);

/**
 * This component renders a weight attribute for a form field.
 * It is used to create a number input field for the user to enter the weight of the field.
 */
export const WeightAttribute = createAttributeComponent(
  weightAttribute,
  (props) => {
    const id = `${props.entity.id}-${props.attribute.name}`;

    return (
      <div className='my-1'>
        <div className='input-container justify-content-end'>
          <Label htmlFor={id}>
            Weight
          </Label>
          <Input
            id={id}
            name={id}
            type='number'
            value={props.attribute.value ?? ''}
            step={1}
            onChange={(e) => props.setValue(Number(e.target.value))}
            placeholder='Weight'
            className='number-input'
          />
        </div>
        <ZodErrorMessage error={props.attribute.error} />
      </div>
    );
  }
);

/**
 * This component renders a text field entity for a form.
 * It is used to create a text input field with a label for the user to enter text.
 */
export const TextFieldEntity = createEntityComponent(
  textFieldEntity,
  (props) => {

    return (
      <div>
        <Input
          id={props.entity.id}
          name={props.entity.id}
          value={props.entity.value ?? ''}
          onChange={(e) => props.setValue(e.target.value)}
          placeholder='Answer goes here...'
        />
        <ZodErrorMessage error={props.entity.error} />
      </div>
    )
  },
);

/**
 * This component renders a number scale entity for a form.
 * It is used to create a number input field with a label for the user to enter a number.
 */
export const NumberScaleEntity = createEntityComponent(
  numberScaleEntity,
  (props) => {
    const min = props.entity.attributes.min ?? 1;
    const max = props.entity.attributes.max ?? 10;

    let minMaxError = min >= max ? 'Minimum value must be less than maximum value.' : null;
    const value = props.entity.value ?? Math.floor((max - min) / 2) + min;

    return (
      <div>
        {minMaxError && <p className='text-danger mt-2'>{minMaxError}</p>}
        <Input
          id={props.entity.id}
          name={props.entity.id}
          type='range'
          defaultValue={value}
          onChange={(e) => props.setValue(Number(e.target.value))}
          min={min}
          max={max}
          step={1}
        />
        <Label htmlFor={props.entity.id}>
          {value}
        </Label>
        <ZodErrorMessage error={props.entity.error} />
      </div>
    )
  },
);

/**
 * This component renders a checkbox entity for a form.
 * It is used to create a checkbox input field with a label for the user to check or uncheck.
 */
export const CheckboxEntity = createEntityComponent(
  checkboxEntity,
  (props) => {

    return (
      <div className='input-container'>
        <Label htmlFor={props.entity.id}>
          {props.entity.attributes.label}
        </Label>
        <Input
          id={props.entity.id}
          name={props.entity.id}
          type='checkbox'
          checked={props.entity.value ?? false}
          onChange={(e) => props.setValue(e.target.checked)}
        />
        <ZodErrorMessage error={props.entity.error} />
      </div>
    )
  },
);