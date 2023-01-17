import axios from 'axios';

export const updateImpersonateSettings = (impersonate: boolean): Promise<void> => {
  const url = '/api/dev-impersonate';
  return axios
    .post(url, { impersonate })
    .then((response) => {
      return response.data;
    })
    .catch((e) => {
      throw new Error(e.response.data.message);
    });
};
