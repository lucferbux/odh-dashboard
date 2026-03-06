import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { Project } from '~/app/types/project';

type ManageProjectModalProps = {
  editProject?: Project;
  onClose: (saved: boolean) => void;
};

const ManageProjectModal: React.FC<ManageProjectModalProps> = ({ editProject, onClose }) => {
  const [name, setName] = React.useState(editProject?.displayName || editProject?.name || '');
  const [description, setDescription] = React.useState(editProject?.description || '');
  const [resourceName, setResourceName] = React.useState(editProject?.name || '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const isEdit = !!editProject;
  const canSubmit = !saving && name.trim().length > 0 && (isEdit || resourceName.trim().length > 0);

  const handleSubmit = () => {
    setSaving(true);
    setError(undefined);

    // TODO: Implement actual API call to create/update project
    // For now, simulate success after a delay
    setTimeout(() => {
      setSaving(false);
      onClose(true);
    }, 500);
  };

  return (
    <Modal variant="medium" isOpen onClose={() => onClose(false)}>
      <ModalHeader title={isEdit ? 'Edit project' : 'Create project'} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <FormGroup label="Name" isRequired fieldId="project-name">
                <TextInput
                  id="project-name"
                  data-testid="manage-project-name"
                  value={name}
                  onChange={(_e, value) => setName(value)}
                  isRequired
                  autoFocus
                />
              </FormGroup>
              {!isEdit && (
                <FormGroup label="Resource name" isRequired fieldId="project-resource-name">
                  <TextInput
                    id="project-resource-name"
                    data-testid="manage-project-resource-name"
                    value={resourceName}
                    onChange={(_e, value) => {
                      setResourceName(value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    isRequired
                  />
                </FormGroup>
              )}
              <FormGroup label="Description" fieldId="project-description">
                <TextArea
                  id="project-description"
                  data-testid="manage-project-description"
                  value={description}
                  onChange={(_e, value) => setDescription(value)}
                  resizeOrientation="vertical"
                />
              </FormGroup>
            </Form>
          </StackItem>
          {error && (
            <StackItem>
              <Alert
                variant="danger"
                isInline
                title={isEdit ? 'Error updating project' : 'Error creating project'}
              >
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="primary"
          isDisabled={!canSubmit}
          isLoading={saving}
          onClick={handleSubmit}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ManageProjectModal;
