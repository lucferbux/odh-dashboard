import * as React from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { Project } from '~/app/types/project';

type DeleteProjectModalProps = {
  project: Project;
  onClose: (deleted: boolean) => void;
};

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ project, onClose }) => {
  const [confirmName, setConfirmName] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const displayName = project.displayName || project.name;
  const canDelete = confirmName === displayName && !deleting;

  const handleDelete = () => {
    setDeleting(true);
    setError(undefined);

    // TODO: Implement actual API call to delete project
    // For now, simulate success after a delay
    setTimeout(() => {
      setDeleting(false);
      onClose(true);
    }, 500);
  };

  return (
    <Modal variant="small" isOpen onClose={() => onClose(false)}>
      <ModalHeader title="Delete project?" titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            This action cannot be undone. It will destroy all workbenches, storages, connections and
            other resources in <strong>{displayName}</strong>.
          </StackItem>
          <StackItem>
            Type <strong>{displayName}</strong> to confirm deletion:
          </StackItem>
          <StackItem>
            <TextInput
              id="confirm-delete-input"
              data-testid="delete-project-confirm-input"
              value={confirmName}
              onChange={(_e, value) => setConfirmName(value)}
              placeholder={displayName}
            />
          </StackItem>
          {error && (
            <StackItem>
              <Alert variant="danger" isInline title="Error deleting project">
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="danger"
          isDisabled={!canDelete}
          isLoading={deleting}
          onClick={handleDelete}
        >
          Delete project
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteProjectModal;
