import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';

type EmptyRegisteredModelsType = {
  preferredModelRegistry?: string;
};
const EmptyRegisteredModels: React.FC<EmptyRegisteredModelsType> = ({ preferredModelRegistry }) => (
  <EmptyState variant={EmptyStateVariant.full} data-testid="no-registered-models">
    <EmptyStateHeader
      title="No models in selected registry"
      icon={<EmptyStateIcon icon={PlusCircleIcon} />}
    />
    <EmptyStateBody>
      {preferredModelRegistry} has no models registered to it. Register a model to this
      <br />
      registry or select a different one.
    </EmptyStateBody>
    <EmptyStateFooter>
      <Button
        id="register-model-empty-button"
        key="register-model-empty-button"
        data-testid="register-model-empty-button"
        aria-label="Register model"
        onClick={() => undefined}
      >
        Register model
      </Button>
      ,
    </EmptyStateFooter>
  </EmptyState>
);

export default EmptyRegisteredModels;
