import { DataConnection } from '~/pages/projects/types';

type MockDataConnectionType = {
  name?: string;
  s3Bucket?: string;
};
export const mockDataConnection = ({
  name = 'test-connection',
  s3Bucket = '',
}: MockDataConnectionType): DataConnection => ({
  type: 0,
  data: {
    apiVersion: '',
    kind: '',
    data: {
      Name: name,
      AWS_ACCESS_KEY_ID: 'id1',
      AWS_SECRET_ACCESS_KEY: 'key1',
      AWS_S3_ENDPOINT: 'endpoint1',
      AWS_DEFAULT_REGION: 'region1',
      AWS_S3_BUCKET: s3Bucket,
    },
    metadata: {
      name: '',
      namespace: '',
    },
  },
});
