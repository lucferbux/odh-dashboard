import { SortableData } from '@odh-dashboard/internal/components/table/types';
import { Project } from '~/app/types/project';

export const projectColumns: SortableData<Project>[] = [
  {
    field: 'name',
    label: 'Name',
    sortable: (a, b) => (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name),
    width: 40,
  },
  {
    field: 'createdAt',
    label: 'Created',
    sortable: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    width: 40,
  },
  {
    field: 'kebab',
    label: '',
    sortable: false,
    width: 20,
  },
];
