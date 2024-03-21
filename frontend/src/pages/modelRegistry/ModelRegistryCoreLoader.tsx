import * as React from 'react';
import { Outlet } from 'react-router';
import ModelServingContextProvider from '~/pages/modelServing/ModelServingContext';

const ModelRegistryCoreLoader: React.FC = () => (
  <ModelServingContextProvider>
    <Outlet />
  </ModelServingContextProvider>
);
export default ModelRegistryCoreLoader;
