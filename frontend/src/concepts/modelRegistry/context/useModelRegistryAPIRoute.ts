import React from 'react';
import useFetchState, {
  FetchState,
  FetchStateCallbackPromise,
  NotReadyError,
} from '~/utilities/useFetchState';
import { getModelRegistryAPIRoute } from '~/api/';
import { RouteKind } from '~/k8sTypes';
import { FAST_POLL_INTERVAL } from '~/utilities/const';
import { SupportedArea, useIsAreaAvailable } from '~/concepts/areas';

type State = string | null;
// TODO dpanshug: need to fetch service of the MR CR
const useModelRegistryAPIRoute = (hasCR: boolean, namespace: string): FetchState<State> => {
  const modelRegistryAreaAvailable = useIsAreaAvailable(SupportedArea.MODEL_REGISTRY).status;
  const callback = React.useCallback<FetchStateCallbackPromise<State>>(
    (opts) => {
      if (!modelRegistryAreaAvailable) {
        // TODO: check not ready error
        return Promise.reject(new NotReadyError('Model registry not enabled'));
      }

      if (!hasCR) {
        return Promise.reject(new NotReadyError('CR not created'));
      }

      return getModelRegistryAPIRoute(namespace, opts)
        .then((result: RouteKind) => `https://${result.spec.host}`)
        .catch((e) => {
          if (e.statusObject?.code === 404) {
            // Not finding is okay, not an error
            return null;
          }
          throw e;
        });
    },
    [hasCR, namespace, modelRegistryAreaAvailable],
  );

  const state = useFetchState<State>(callback, null, {
    initialPromisePurity: true,
  });

  const [data, , , refresh] = state;

  const hasData = !!data;
  React.useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (!hasData) {
      interval = setInterval(refresh, FAST_POLL_INTERVAL);
    }
    return () => {
      clearInterval(interval);
    };
  }, [hasData, refresh]);
  return state;
};

export default useModelRegistryAPIRoute;
