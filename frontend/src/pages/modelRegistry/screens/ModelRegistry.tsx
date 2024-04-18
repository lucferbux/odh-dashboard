import React from 'react';
import ApplicationsPage from '~/pages/ApplicationsPage';
import useRegisteredModels from '~/concepts/modelRegistry/apiHooks/useRegisteredModels';
import { ModelRegistrySelectorContext } from '~/concepts/modelRegistry/context/ModelRegistrySelectorContext';
import TitleWithIcon from '~/concepts/design/TitleWithIcon';
import { ProjectObjectType } from '~/concepts/design/utils';
import EmptyRegisteredModels from './EmptyRegisteredModels';
import RegisteredModelListView from './RegisteredModelListView';
import ModelRegistrySelector from './ModelRegistrySelector';

const ModelRegistry: React.FC = () => {
  const { preferredModelRegistry } = React.useContext(ModelRegistrySelectorContext);
  const [registeredModels, loaded, loadError] = useRegisteredModels();

  return (
    <ApplicationsPage
      empty={registeredModels.size === 0}
      emptyStatePage={
        <EmptyRegisteredModels preferredModelRegistry={preferredModelRegistry?.metadata.name} />
      }
      title={
        <TitleWithIcon title="Deployed models" objectType={ProjectObjectType.deployedModels} />
      }
      description="View and manage your registered models."
      headerContent={<ModelRegistrySelector />}
      loadError={loadError}
      loaded={loaded}
      provideChildrenPadding
    >
      <RegisteredModelListView registeredModels={registeredModels.items} />
    </ApplicationsPage>
  );
};

export default ModelRegistry;
