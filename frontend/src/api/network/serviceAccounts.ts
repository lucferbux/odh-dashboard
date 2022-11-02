import { k8sCreateResource } from '@openshift/dynamic-plugin-sdk-utils';
import { ServiceAccountModel } from 'api/models';
import { ServiceAccountKind } from 'k8sTypes';

export const assembleModelServerSA = (namespace: string): ServiceAccountKind => {
  const modelServerSA = `model-server-sa-${namespace}`;

  const serviceAccount: ServiceAccountKind = {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: modelServerSA,
      namespace,
    },
  };
  return serviceAccount;
};

export const createServiceAccount = async (
  data: ServiceAccountKind,
): Promise<ServiceAccountKind> => {
  return k8sCreateResource<ServiceAccountKind>({
    model: ServiceAccountModel,
    resource: data,
  });
};
