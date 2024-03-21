import { k8sGetResource, k8sListResource } from '@openshift/dynamic-plugin-sdk-utils';
import {
  MODEL_REGISTRY_DEFINITION_NAME,
  MODEL_REGISTRY_ROUTE_NAME,
} from '~/concepts/modelRegistry/const';
import { K8sAPIOptions, ModelRegistryKind, RouteKind } from '~/k8sTypes';
import { getRoute } from '~/api';
import { applyK8sAPIOptions } from '~/api/apiMergeUtils';
import { ModelRegistryModel } from '~/api/models/modelRegistry';

export const getModelRegistryAPIRoute = async (
  namespace: string,
  opts?: K8sAPIOptions,
): Promise<RouteKind> => getRoute(MODEL_REGISTRY_ROUTE_NAME, namespace, opts);

export const getModelRegistryCR = async (
  namespace: string,
  opts?: K8sAPIOptions,
): Promise<ModelRegistryKind> =>
  k8sGetResource<ModelRegistryKind>(
    applyK8sAPIOptions(
      {
        model: ModelRegistryModel,
        queryOptions: {
          ns: namespace,
          name: MODEL_REGISTRY_DEFINITION_NAME,
        },
      },
      opts,
    ),
  );

export const listModelRegistries = async (): Promise<ModelRegistryKind[]> =>
  k8sListResource<ModelRegistryKind>({
    model: ModelRegistryModel,
  }).then((listResource) => listResource.items);
