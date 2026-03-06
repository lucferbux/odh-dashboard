import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from './components/NotFound';
import MainPage from './pages/MainPage';
import { ProjectsPage } from './pages/projects';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/projects" replace />} />
    <Route path="/main-view/*" element={<MainPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
