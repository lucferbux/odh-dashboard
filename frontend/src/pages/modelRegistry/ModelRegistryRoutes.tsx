import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ModelRegistryCoreLoader from './ModelRegistryCoreLoader';
import ModelRegistry from './screens/ModelRegistry';

const ModelServingRoutes: React.FC = () => (
  <Routes>
    <Route
      path={'/:modelRegistry?/*'}
      element={
        <ModelRegistryCoreLoader
          getInvalidRedirectPath={(modelRegistry) => `/modelRegistry/${modelRegistry}`}
        />
      }
    >
      <Route index element={<ModelRegistry />} />
      <Route path="*" element={<Navigate to="." />} />
    </Route>
  </Routes>
);

export default ModelServingRoutes;
