import React from 'react';
import useRegisteredModels from '~/concepts/modelRegistry/apiHooks/useRegisteredModels';
import ApplicationsPage from '~/pages/ApplicationsPage';

const ModelRegistryEmpty: React.FC = () => {
  const a = useRegisteredModels();
  React.useEffect(() => {
    console.log('useRegisteredModels', a);
  }, []);

  return (
    <>
      <ApplicationsPage
        title="Registered models"
        description="View and manage your registered models."
        loaded
        empty
        provideChildrenPadding
      />
    </>
  );
};

export default ModelRegistryEmpty;
