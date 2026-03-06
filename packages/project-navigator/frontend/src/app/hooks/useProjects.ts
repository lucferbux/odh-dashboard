import { useFetchState, APIOptions, FetchStateCallbackPromise } from 'mod-arch-core';
import React from 'react';
import { getProjects } from '~/app/api/projects';
import { ProjectList } from '~/app/types/project';

const emptyProjectList: ProjectList = { items: [] };

export const useProjects = (): [ProjectList, boolean, Error | undefined, () => void] => {
  const callback = React.useCallback<FetchStateCallbackPromise<ProjectList>>(
    (opts: APIOptions) => getProjects('')(opts),
    [],
  );
  const [projects, loaded, error, refresh] = useFetchState<ProjectList>(callback, emptyProjectList);

  return [projects, loaded, error, refresh];
};
