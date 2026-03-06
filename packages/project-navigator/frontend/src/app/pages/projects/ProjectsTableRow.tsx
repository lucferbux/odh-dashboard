import * as React from 'react';
import { ActionsColumn, Td, Tr } from '@patternfly/react-table';
import { Content, ContentVariants, Timestamp } from '@patternfly/react-core';
import { TableRowTitleDescription } from '@odh-dashboard/internal/components/table';
import { Project } from '~/app/types/project';

type ProjectsTableRowProps = {
  project: Project;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
};

const ProjectsTableRow: React.FC<ProjectsTableRowProps> = ({
  project,
  onEditProject,
  onDeleteProject,
}) => (
  <Tr>
    <Td dataLabel="Name">
      <TableRowTitleDescription
        title={<strong>{project.displayName || project.name}</strong>}
        description={project.description}
        truncateDescriptionLines={2}
        subtitle={
          project.owner ? (
            <Content component={ContentVariants.small}>{project.owner}</Content>
          ) : undefined
        }
      />
    </Td>
    <Td dataLabel="Created">
      <Timestamp date={new Date(project.createdAt)} />
    </Td>
    <Td isActionCell>
      <ActionsColumn
        items={[
          {
            title: 'Edit project',
            onClick: () => onEditProject(project),
          },
          {
            isSeparator: true,
          },
          {
            title: 'Delete project',
            onClick: () => onDeleteProject(project),
          },
        ]}
      />
    </Td>
  </Tr>
);

export default ProjectsTableRow;
