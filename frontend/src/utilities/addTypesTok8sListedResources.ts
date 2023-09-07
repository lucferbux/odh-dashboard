import {
  K8sModelCommon,
  K8sResourceCommon,
  K8sResourceListResult,
} from '@openshift/dynamic-plugin-sdk-utils';

export const addTypesTok8sListedResources = <TResource extends K8sResourceCommon>(
  response: K8sResourceListResult<TResource>,
  model: K8sModelCommon,
): K8sResourceListResult<TResource> => ({
  ...response,
  items: response.items.map((i) => ({
    ...i,
    apiVersion: response.apiVersion,
    kind: model.kind,
  })),
});
