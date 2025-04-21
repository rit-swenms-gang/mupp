import { createBuilder } from '@coltorapps/builder';

import { isLeaderEntity, numberScaleEntity, textFieldEntity } from './entities';

// Think of builders as collections of supported entities. 
// For example, you can have a form builder that allows adding text and select fields to a form, 
// but also another landing page builder that allows adding hero sections and feature sections to a landing page. 
// For now, we're going to focus solely on the form builder.

export const formBuilder = createBuilder({
  entities: [isLeaderEntity, textFieldEntity, numberScaleEntity],
});