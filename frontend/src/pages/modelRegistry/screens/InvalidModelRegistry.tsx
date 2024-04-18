import * as React from 'react';
import EmptyStateErrorMessage from '~/components/EmptyStateErrorMessage';
import ProjectSelectorNavigator from '~/concepts/projects/ProjectSelectorNavigator';

type InvalidModelRegistryProps = {
  title?: string;
  modelRegistry?: string;
  getRedirectPath: (namespace: string) => string;
};

const InvalidModelRegistry: React.FC<InvalidModelRegistryProps> = ({
  title,
  modelRegistry,
  getRedirectPath,
}) => (
  <EmptyStateErrorMessage
    title={title || 'Model Registry not found'}
    bodyText={`${
      modelRegistry ? `Model Registry ${modelRegistry}` : 'The Model Registry'
    } was not found.`}
  >
    {/* TODO: Replace this with a model registry selector */}
    <ProjectSelectorNavigator
      getRedirectPath={getRedirectPath}
      invalidDropdownPlaceholder="Select project"
      primary
    />
  </EmptyStateErrorMessage>
);

export default InvalidModelRegistry;
