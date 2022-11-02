import * as React from 'react';
import { ActionsColumn, ExpandableRowContent, Td, Tr } from '@patternfly/react-table';
import { Spinner, Text, TextVariants, Title } from '@patternfly/react-core';
import { NotebookState } from '../../../notebook/types';
import { getNotebookDescription, getNotebookDisplayName } from '../../../utils';
import NotebookRouteLink from '../../../notebook/NotebookRouteLink';
import NotebookStatusToggle from '../../../notebook/NotebookStatusToggle';
import { NotebookKind } from '../../../../../k8sTypes';
import NotebookImagePackageDetails from '../../../notebook/NotebookImagePackageDetails';
import useNotebookSize from './useNotebookSize';
import useNotebookImage from './useNotebookImage';
import NotebookSizeDetails from './NotebookSizeDetails';
import NotebookStorageBars from './NotebookStorageBars';

type NotebookTableRowProps = {
  obj: NotebookState;
  onNotebookDelete: (notebook: NotebookKind) => void;
  onNotebookAddStorage: (notebook: NotebookKind) => void;
};

const NotebookTableRow: React.FC<NotebookTableRowProps> = ({
  obj,
  onNotebookDelete,
  onNotebookAddStorage,
}) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false);
  const notebookSize = useNotebookSize(obj.notebook);
  const [notebookImage, loaded] = useNotebookImage(obj.notebook);

  return (
    <>
      <Tr>
        <Td expand={{ rowIndex: 0, isExpanded, onToggle: () => setExpanded(!isExpanded) }} />
        <Td>
          <Title headingLevel="h4">{getNotebookDisplayName(obj.notebook)}</Title>
          <Text>{getNotebookDescription(obj.notebook)}</Text>
        </Td>
        <Td>
          {!loaded ? (
            <Spinner size="md" />
          ) : (
            <Text component="p">{notebookImage?.imageName ?? 'Unknown'}</Text>
          )}
          {isExpanded && notebookImage?.tagSoftware && (
            <Text component={TextVariants.small}>{notebookImage.tagSoftware}</Text>
          )}
        </Td>
        <Td>{notebookSize?.name ?? 'Unknown'}</Td>
        <Td>
          <NotebookStatusToggle notebookState={obj} />
        </Td>
        <Td>
          <NotebookRouteLink label="Open" notebook={obj.notebook} isRunning={obj.isRunning} />
        </Td>
        <Td isActionCell>
          <ActionsColumn
            items={[
              {
                title: 'Edit workbench',
                onClick: () => {
                  alert('Not implemented yet');
                },
              },
              {
                title: 'Delete workbench',
                onClick: () => {
                  onNotebookDelete(obj.notebook);
                },
              },
            ]}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td>
          <ExpandableRowContent>
            <NotebookStorageBars notebook={obj.notebook} onAddStorage={onNotebookAddStorage} />
          </ExpandableRowContent>
        </Td>
        <Td>
          <ExpandableRowContent>
            {notebookImage ? (
              <NotebookImagePackageDetails dependencies={notebookImage.dependencies} />
            ) : (
              'Unknown package info'
            )}
          </ExpandableRowContent>
        </Td>
        <Td>
          <ExpandableRowContent>
            {notebookSize && <NotebookSizeDetails notebookSize={notebookSize} />}
          </ExpandableRowContent>
        </Td>
        <Td />
        <Td />
        <Td />
      </Tr>
    </>
  );
};

export default NotebookTableRow;