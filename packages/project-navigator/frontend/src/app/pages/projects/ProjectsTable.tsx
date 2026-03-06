import * as React from 'react';
import Table from '@odh-dashboard/internal/components/table/Table';
import DashboardEmptyTableView from '@odh-dashboard/internal/concepts/dashboard/DashboardEmptyTableView';
import { Project } from '~/app/types/project';
import { projectColumns } from './columns';
import ProjectsTableRow from './ProjectsTableRow';
import ProjectsToolbar, { ProjectFilterOption } from './ProjectsToolbar';
import ManageProjectModal from './ManageProjectModal';
import DeleteProjectModal from './DeleteProjectModal';

type ProjectsTableProps = {
  projects: Project[];
  onRefresh: () => void;
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onRefresh }) => {
  const [filterOption, setFilterOption] = React.useState<ProjectFilterOption>(
    ProjectFilterOption.Name,
  );
  const [filterValue, setFilterValue] = React.useState('');
  const [editProject, setEditProject] = React.useState<Project | undefined>();
  const [deleteProject, setDeleteProject] = React.useState<Project | undefined>();
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const filteredProjects = React.useMemo(
    () =>
      projects.filter((p) => {
        const searchText = filterValue.toLowerCase();
        if (filterOption === ProjectFilterOption.Name) {
          return (
            p.name.toLowerCase().includes(searchText) ||
            (p.displayName?.toLowerCase().includes(searchText) ?? false)
          );
        }
        // Filter by User (owner)
        return p.owner?.toLowerCase().includes(searchText) ?? false;
      }),
    [projects, filterValue, filterOption],
  );

  const resetFilters = () => {
    setFilterValue('');
  };

  return (
    <>
      <Table
        data-testid="projects-table"
        id="projects-table"
        enablePagination
        data={filteredProjects}
        columns={projectColumns}
        defaultSortColumn={0}
        onClearFilters={resetFilters}
        emptyTableView={<DashboardEmptyTableView onClearFilters={resetFilters} />}
        toolbarContent={
          <ProjectsToolbar
            filterOption={filterOption}
            onFilterOptionChange={setFilterOption}
            filterValue={filterValue}
            onFilterValueChange={setFilterValue}
            onCreateProject={() => setCreateModalOpen(true)}
          />
        }
        rowRenderer={(project) => (
          <ProjectsTableRow
            key={project.name}
            project={project}
            onEditProject={setEditProject}
            onDeleteProject={setDeleteProject}
          />
        )}
      />
      {(createModalOpen || editProject) && (
        <ManageProjectModal
          editProject={editProject}
          onClose={(saved) => {
            setCreateModalOpen(false);
            setEditProject(undefined);
            if (saved) {
              onRefresh();
            }
          }}
        />
      )}
      {deleteProject && (
        <DeleteProjectModal
          project={deleteProject}
          onClose={(deleted) => {
            setDeleteProject(undefined);
            if (deleted) {
              onRefresh();
            }
          }}
        />
      )}
    </>
  );
};

export default ProjectsTable;
