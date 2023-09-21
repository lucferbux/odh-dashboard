import { K8sResourceCommon } from '@openshift/dynamic-plugin-sdk-utils';
import { addTypesToK8sListedResources } from '~/utilities/addTypesToK8sListedResources';

const servingRuntimeTemplate = {
  kind: 'TemplateList',
  apiVersion: 'template.openshift.io/v1',
  metadata: {
    resourceVersion: '',
    continue: '',
  },
  items: [
    {
      metadata: {
        name: 'template-ar2pcc',
        namespace: 'opendatahub',
        uid: '31277020-b60a-40c9-91bc-5ee3e2bb25ec',
        resourceVersion: '164740435',
        creationTimestamp: '2023-05-03T21:58:17Z',
        labels: {
          'opendatahub.io/dashboard': 'true',
        },
        annotations: {
          tags: 'new-one,servingruntime',
        },
      },
      objects: [
        {
          apiVersion: 'serving.kserve.io/v1alpha1',
          kind: 'ServingRuntime',
          metadata: {
            name: 'test',
            annotations: {
              'openshift.io/display-name': 'New OVMS Server',
            },
            labels: {
              'opendatahub.io/dashboard': 'true',
            },
          },
        },
      ],
    },
  ],
};

const templateWithKind = {
  apiVersion: 'v1',
  apiGroup: 'template.openshift.io',
  kind: 'Template',
  plural: 'templates',
};

describe('addTypesToK8sListedResources', () => {
  it('should have kind as Template', () => {
    const list = addTypesToK8sListedResources(servingRuntimeTemplate, templateWithKind);
    expect(list).not.toBe(servingRuntimeTemplate);
    expect(list.items).toHaveLength(servingRuntimeTemplate.items.length);
    list.items.forEach((i: Partial<K8sResourceCommon>) => {
      expect(i.kind).toBe('Template');
      expect(i.apiVersion).toBe('template.openshift.io/v1');
    });
  });
});
