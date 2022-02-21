import createError from 'http-errors';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { KubeFastifyInstance, KubeStatus } from '../../../types';
import { DEV_MODE } from '../../../utils/constants';
import { addCORSHeader } from '../../../utils/responseUtils';
import { V1RoleBinding, V1Subject } from '@kubernetes/client-node';

const status = async (
  fastify: KubeFastifyInstance,
  request: FastifyRequest,
): Promise<{ kube: KubeStatus }> => {
  const kubeContext = fastify.kube.currentContext;
  const { currentContext, namespace, currentUser, clusterID, clusterBranding } = fastify.kube;
  const currentUserName =
    (request.headers['x-forwarded-user'] as string) || currentUser.username || currentUser.name;
  let userName = currentUserName?.split('/')[0];
  if (!userName || userName === 'inClusterUser') {
    userName = 'kube:admin';
  }
  const rbac = fastify.kube.rbac;
  let isAdmin = false;
  try {
    const bindings = await rbac.listNamespacedRoleBinding('redhat-ods-applications');
    const items = bindings.body.items;
    items.map((roleBinding: V1RoleBinding) => {
      if (roleBinding.roleRef.name === 'admin') {
        roleBinding.subjects.find((subject: V1Subject) => {
          if (subject.kind === 'User' && subject.name === userName) {
            isAdmin = true;
            return true;
          }
          return false;
        });
      }
    });
  } catch (e) {
    console.log('Failed to get role bindings: ' + e.toString());
  }
  fastify.kube.coreV1Api.getAPIResources();
  if (!kubeContext && !kubeContext.trim()) {
    const error = createError(500, 'failed to get kube status');
    error.explicitInternalServerError = true;
    error.error = 'failed to get kube status';
    error.message =
      'Unable to determine current login stats. Please make sure you are logged into OpenShift.';
    fastify.log.error(error, 'failed to get status');
    throw error;
  } else {
    return Promise.resolve({
      kube: {
        currentContext,
        currentUser,
        namespace,
        userName,
        clusterID,
        clusterBranding,
        isAdmin,
      },
    });
  }
};

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    return status(fastify, request)
      .then((res) => {
        if (DEV_MODE) {
          addCORSHeader(request, reply);
        }
        return res;
      })
      .catch((res) => {
        console.log(`ERROR: devMode: ${DEV_MODE}`);
        if (DEV_MODE) {
          addCORSHeader(request, reply);
        }
        reply.send(res);
      });
  });
};
