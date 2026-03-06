import * as React from 'react';
import {
  Bullseye,
  Flex,
  FlexItem,
  PageSection,
  Spinner,
  Alert,
  Content,
  Title,
} from '@patternfly/react-core';
import { FolderIcon } from '@patternfly/react-icons';
import { useProjects } from '~/app/hooks/useProjects';
import ProjectsTable from './ProjectsTable';

const ProjectsPage: React.FC = () => {
  const [projects, loaded, error, refresh] = useProjects();

  if (error) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Alert variant="danger" title="Failed to load projects" isInline>
          {error.message}
        </Alert>
      </PageSection>
    );
  }

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Flex
            spaceItems={{ default: 'spaceItemsSm' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <FolderIcon
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--pf-t--global--icon--color--brand--default)',
                }}
              />
            </FlexItem>
            <FlexItem>
              <Title headingLevel="h1">Projects</Title>
            </FlexItem>
          </Flex>
          <p>View your existing projects or create new projects.</p>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <ProjectsTable projects={projects.items} onRefresh={refresh} />
      </PageSection>
    </>
  );
};

export default ProjectsPage;
