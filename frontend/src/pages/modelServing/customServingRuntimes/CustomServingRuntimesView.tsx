import * as React from 'react';
import ApplicationsPage from '~/pages/ApplicationsPage';
import EmptyCustomServingRuntime from './EmptyCustomServingRuntime';
import { CustomServingRuntimeContext } from './CustomServingRuntimeContext';

const CustomServingRuntimesView: React.FC = () => {
  const {
    servingRuntimeTemplates: { data: servingRuntimeTemplates },
  } = React.useContext(CustomServingRuntimeContext);

  return (
    <ApplicationsPage
      title="Serving runtimes"
      description="Manage model serving runtimes"
      loaded // already checked this in the context provider so loaded is always true here
      empty={servingRuntimeTemplates.length === 0}
      emptyStatePage={<EmptyCustomServingRuntime />}
      provideChildrenPadding
    >
      {servingRuntimeTemplates.map((servingRuntime) => (
        <div key={servingRuntime.metadata.name}>
          <p>{servingRuntime.metadata.name}</p>
          <p>{servingRuntime.metadata.annotations?.description || ''}</p>
        </div>
      ))}
    </ApplicationsPage>
  );
};

export default CustomServingRuntimesView;