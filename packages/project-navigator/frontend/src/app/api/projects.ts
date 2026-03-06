import { APIOptions, handleRestFailures, isModArchResponse, restGET } from 'mod-arch-core';
import { BFF_API_VERSION, URL_PREFIX } from '~/app/utilities/const';
import { ProjectList } from '~/app/types/project';

export const getProjects =
  (hostPath: string) =>
  (opts: APIOptions): Promise<ProjectList> =>
    handleRestFailures(
      restGET(hostPath, `${URL_PREFIX}/api/${BFF_API_VERSION}/projects`, {}, opts),
    ).then((response) => {
      if (isModArchResponse<ProjectList>(response)) {
        return response.data;
      }
      throw new Error('Invalid response format');
    });
