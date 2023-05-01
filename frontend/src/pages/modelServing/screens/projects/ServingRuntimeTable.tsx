import * as React from 'react';
import Table from '~/components/Table';
import { SecretKind, ServingRuntimeKind, TemplateKind } from '~/k8sTypes';
import useTableColumnSort from '~/utilities/useTableColumnSort';
import { ProjectDetailsContext } from '~/pages/projects/ProjectDetailsContext';
import { ServingRuntimeTableTabs } from '~/pages/modelServing/screens/types';
import { useAppContext } from '~/app/AppContext';
import { featureFlagEnabled } from '~/utilities/utils';
import { filterTokens } from './utils';
import { columns } from './data';
import ServingRuntimeTableRow from './ServingRuntimeTableRow';
import DeleteServingRuntimeModal from './DeleteServingRuntimeModal';
import ManageServingRuntimeModal from './ServingRuntimeModal/ManageServingRuntimeModal';
import ManageInferenceServiceModal from './InferenceServiceModal/ManageInferenceServiceModal';

type ServingRuntimeTableProps = {
  modelServers: ServingRuntimeKind[];
  modelSecrets: SecretKind[];
  templates?: TemplateKind[];
  refreshServingRuntime: () => void;
  refreshTokens: () => void;
  refreshInferenceServices: () => void;
  expandedColumn?: ServingRuntimeTableTabs;
  updateExpandedColumn: (column?: ServingRuntimeTableTabs) => void;
};

const ServingRuntimeTable: React.FC<ServingRuntimeTableProps> = ({
  modelServers: unsortedModelServers,
  modelSecrets,
  templates,
  refreshServingRuntime,
  refreshTokens,
  refreshInferenceServices,
  expandedColumn,
  updateExpandedColumn,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const {
    servingRuntimes: { data: modelServers },
    dataConnections: { data: dataConnections },
    currentProject,
  } = React.useContext(ProjectDetailsContext);

  const [deleteServingRuntime, setDeleteServingRuntime] = React.useState<ServingRuntimeKind>();
  const [editServingRuntime, setEditServingRuntime] = React.useState<ServingRuntimeKind>();
  const sort = useTableColumnSort<ServingRuntimeKind>(columns, 1);
  const sortedModelServers = sort.transformData(unsortedModelServers);

  const { dashboardConfig } = useAppContext();
  const customServingRuntimesEnabled = featureFlagEnabled(
    dashboardConfig.spec.dashboardConfig.disableCustomServingRuntimes,
  );

  return (
    <>
      <Table
        data={sortedModelServers}
        columns={columns}
        disableRowRenderSupport
        rowRenderer={(modelServer) => (
          <ServingRuntimeTableRow
            key={modelServer.metadata.uid}
            obj={modelServer}
            onDeleteServingRuntime={(obj) => setDeleteServingRuntime(obj)}
            onEditServingRuntime={(obj) => setEditServingRuntime(obj)}
            onDeployModal={() => setOpen(true)}
            onExpandColumn={(colIndex?: ServingRuntimeTableTabs) => {
              updateExpandedColumn(expandedColumn === colIndex ? undefined : colIndex);
            }}
            expandedColumn={expandedColumn}
          />
        )}
      />
      <DeleteServingRuntimeModal
        servingRuntime={deleteServingRuntime}
        tokens={filterTokens(
          modelSecrets,
          deleteServingRuntime?.metadata.name || '',
          currentProject.metadata.name,
          customServingRuntimesEnabled,
        )}
        onClose={(deleted) => {
          if (deleted) {
            refreshServingRuntime();
          }
          setDeleteServingRuntime(undefined);
        }}
      />
      <ManageServingRuntimeModal
        isOpen={editServingRuntime !== undefined}
        currentProject={currentProject}
        servingRuntimeTemplates={templates}
        editInfo={{
          servingRuntime: editServingRuntime,
          secrets: filterTokens(
            modelSecrets,
            editServingRuntime?.metadata.name || '',
            currentProject.metadata.name,
            customServingRuntimesEnabled,
          ),
        }}
        onClose={(submit: boolean) => {
          setEditServingRuntime(undefined);
          if (submit) {
            refreshServingRuntime();
            refreshInferenceServices();
            setTimeout(refreshTokens, 500); // need a timeout to wait for tokens creation
          }
        }}
      />
      <ManageInferenceServiceModal
        isOpen={isOpen}
        onClose={(submit: boolean) => {
          setOpen(false);
          if (submit) {
            refreshInferenceServices();
          }
        }}
        projectContext={{
          currentProject,
          currentServingRuntime: modelServers[0],
          dataConnections,
        }}
      />
    </>
  );
};

export default ServingRuntimeTable;
