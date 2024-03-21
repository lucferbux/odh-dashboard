import * as React from 'react';
import { PipelineCoreResourceKFv2, PipelineKFCallCommon } from '~/concepts/pipelines/kfTypes';
import useFetchState, { FetchState, FetchStateCallbackPromise } from '~/utilities/useFetchState';
import { POLL_INTERVAL } from '~/utilities/const';
import { K8sAPIOptions } from '~/k8sTypes';
import {
  ModelRegistryBase,
  ModelRegistryListPaged,
  ModelRegistryListParams,
  // ModelRegistryListParamsOptions,
} from '~/concepts/modelRegistry/types';

export type PipelineKFCallCommonWithItems<T extends PipelineCoreResourceKFv2> =
  PipelineKFCallCommon<unknown> & { items?: T[] };

// TODO: add filter
const useModelRegistryListQuery = <T extends ModelRegistryBase>(
  apiFetch: (opts: K8sAPIOptions) => Promise<ModelRegistryListParams & { items: T[] }>,
  // options?: ModelRegistryListParamsOptions,
  refreshRate = POLL_INTERVAL,
): FetchState<ModelRegistryListPaged<T>> => {
  const [totalSize, setTotalSize] = React.useState(0);
  // const { page = 1 } = options ?? {};
  // const pageTokensRef = React.useRef<(string | undefined)[]>([]);

  const call = React.useCallback<FetchStateCallbackPromise<ModelRegistryListPaged<T>>>(
    async (opts) => {
      // if (page > 1 && !pageTokensRef.current[page - 1]) {
      //   throw new Error(`No token available for page ${page}.`);
      // }

      const result = await apiFetch(opts);
      return {
        size: result.size || result.items.length || 0,
        pageSize: result.pageSize,
        items: result.items,
        nextPageToken: result.nextPageToken,
      };
    },
    [apiFetch],
  );

  const [result, loaded, error, refresh] = useFetchState<ModelRegistryListPaged<T>>(
    call,
    { items: [], size: 0, pageSize: 0, nextPageToken: '' },
    {
      initialPromisePurity: false,
      refreshRate,
    },
  );

  React.useEffect(() => {
    if (loaded) {
      // Update only when loaded turns to true or when we have a new totalSize
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTotalSize(result.size);
    }
  }, [loaded, result.size]);

  // React.useEffect(() => {
  //   if (loaded && pageTokensRef.current[page] !== result.nextPageToken) {
  //     const newTokens = pageTokensRef.current.slice(0, page);
  //     newTokens[page] = result.nextPageToken;
  //     pageTokensRef.current = newTokens;
  //   }
  //   // Update only when loaded turns to true or when we have a new nextPageToken
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [loaded, result.nextPageToken]);

  return [
    // return the cached total size when not loaded
    { ...result, size: loaded ? result.size : totalSize },
    loaded,
    error,
    refresh,
  ];
};

export default useModelRegistryListQuery;
