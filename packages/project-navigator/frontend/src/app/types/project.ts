export type ProjectStatus = 'Active' | 'Terminating';

export type Project = {
  name: string;
  displayName?: string;
  description?: string;
  owner?: string;
  status: ProjectStatus;
  createdAt: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export type ProjectList = {
  items: Project[];
  nextPageToken?: string;
  totalSize?: number;
};
