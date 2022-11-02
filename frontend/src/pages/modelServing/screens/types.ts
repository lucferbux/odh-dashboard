export type CreatingModelServerObject = {
  numReplicas: number;
  modelSize: ModelServerSize;
  gpus: number;
  externalRoute: boolean;
  tokenAuth: boolean;
  tokens: ModelServerToken[];
};

export type ModelServerToken = {
  uuid: string;
  name: string;
  error: string;
};

export type ModelServerResources = {
  limits: {
    cpu: string;
    memory: string;
  };
  requests: {
    cpu: string;
    memory: string;
  };
};

export type ModelServerSize = {
  name: string;
  resources: ModelServerResources;
};