import * as React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
  Modal,
} from '@patternfly/react-core';
import { useCreateServingRuntimeObject } from '../utils';
import { ProjectDetailsContext } from '../../../../projects/ProjectDetailsContext';
import {
  addSupportModelMeshProject,
  assembleSecretSA,
  createRoleBinding,
  createSecret,
  generateRoleBindingServingRuntime,
} from '../../../../../api';
import { createServingRuntime } from '../../../../../api/network/servingRuntimes';
import { ServingRuntimeKind, ProjectKind, SecretKind } from '../../../../../k8sTypes';
import {
  assembleServingRuntimeSA,
  createServiceAccount,
} from '../../../../../api/network/serviceAccounts';
import { allSettledPromises } from '../../../../../utilities/allSettledPromises';
import ModelServerReplicaSection from './ServingRuntimeReplicaSection';
import ModelServerSizeSection from './ServingRuntimeSizeSection';
import ModelServerTokenSection from './ServingRuntimeTokenSection';

type ManageModelServerModalProps = {
  isOpen: boolean;
  onClose: (submit: boolean) => void;
};

const ManageModelServerModal: React.FC<ManageModelServerModalProps> = ({ isOpen, onClose }) => {
  const [createData, setCreateData, resetData, sizes] = useCreateServingRuntimeObject();
  const [actionInProgress, setActionInProgress] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | undefined>();

  const { currentProject } = React.useContext(ProjectDetailsContext);
  const namespace = currentProject.metadata.name;

  const tokenErrors = createData.tokens.filter((token) => token.error !== '').length > 0;

  const canCreate = !actionInProgress && !tokenErrors;

  const onBeforeClose = (submitted: boolean) => {
    onClose(submitted);
    setActionInProgress(false);
    resetData();
  };

  const setErrorModal = (error: Error) => {
    setError(error);
    setActionInProgress(false);
  };

  const enableTokenAuth = async (): Promise<void> => {
    if (!createData.tokenAuth) {
      return Promise.resolve();
    }

    const modelMeshSA = assembleServingRuntimeSA(namespace);
    createServiceAccount(modelMeshSA)
      .then(() => {
        const tokenAuth = generateRoleBindingServingRuntime(namespace);
        createRoleBinding(tokenAuth)
          .then(() => {
            allSettledPromises<SecretKind, Error>(
              createData.tokens.map((token) => {
                const secretToken = assembleSecretSA(token.name, namespace);
                return createSecret(secretToken);
              }),
            )
              .then(() => {
                return Promise.resolve();
              })
              .catch((error) => {
                return Promise.reject(error);
              });
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  const submit = () => {
    setError(undefined);
    setActionInProgress(true);

    allSettledPromises<ServingRuntimeKind | ProjectKind | void, Error>([
      addSupportModelMeshProject(currentProject.metadata.name),
      createServingRuntime(createData, namespace),
      enableTokenAuth(),
    ])
      .then(() => {
        setActionInProgress(false);
        onBeforeClose(true);
      })
      .catch((e) => setErrorModal(e));
  };

  return (
    <Modal
      title="Configure model server"
      variant="medium"
      isOpen={isOpen}
      onClose={() => onBeforeClose(false)}
      showClose
      actions={[
        <Button key="submit-model" variant="primary" isDisabled={!canCreate} onClick={submit}>
          Configure
        </Button>,
        <Button key="cancel-model" variant="secondary" onClick={() => onBeforeClose(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <ModelServerReplicaSection data={createData} setData={setCreateData} />

        <ModelServerSizeSection data={createData} setData={setCreateData} sizes={sizes} />

        <FormSection title="Model route" titleElement="div">
          <FormGroup>
            <Checkbox
              label="Make deployed available via an external route"
              id="alt-form-checkbox-route"
              name="alt-form-checkbox-route"
              isChecked={createData.externalRoute}
              onChange={(check) => setCreateData('externalRoute', check)}
            />
          </FormGroup>
        </FormSection>

        <ModelServerTokenSection data={createData} setData={setCreateData} />
      </Form>
      {error && (
        <Alert isInline variant="danger" title="Error creating model server">
          {error.message}
        </Alert>
      )}
    </Modal>
  );
};

export default ManageModelServerModal;