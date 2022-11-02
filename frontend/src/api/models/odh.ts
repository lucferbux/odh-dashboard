import { K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';

export const ODHDashboardConfigModel: K8sModelCommon = {
  apiVersion: 'v1alpha',
  apiGroup: 'opendatahub.io',
  kind: 'ODHDashboardConfig',
  plural: 'odhdashboardconfigs',
};

export const NotebookModel: K8sModelCommon = {
  apiVersion: 'v1',
  apiGroup: 'kubeflow.org',
  kind: 'Notebook',
  plural: 'notebooks',
};

export const ModelServerModel: K8sModelCommon = {
  apiVersion: 'v1alpha1',
  apiGroup: 'serving.kserve.io',
  kind: 'ServingRuntime',
  plural: 'servingruntimes',
};