import { ProjectSectionID, ProjectSectionTitlesType } from './types';

export const ProjectSectionTitles: ProjectSectionTitlesType = {
  [ProjectSectionID.WORKBENCHES]: 'Workbenches',
  [ProjectSectionID.STORAGES]: 'Storages',
  [ProjectSectionID.DATA_CONNECTIONS]: 'Data connections',
};

export const ProjectSectionTitlesExtended: ProjectSectionTitlesType = {
  ...ProjectSectionTitles,
  [ProjectSectionID.MODEL_SERVER]: 'Model server',
};