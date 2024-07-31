import * as React from 'react';
import { ImageStreamKind, NotebookKind } from '~/k8sTypes';
import useNamespaces from '~/pages/notebookController/useNamespaces';
import useImageStreams from '~/pages/projects/screens/spawner/useImageStreams';
import { PodContainer } from '~/types';
import { getImageStreamDisplayName } from '~/pages/projects/screens/spawner/spawnerUtils';
import { NotebookImageAvailability } from './const';
import { NotebookImageData } from './types';

export const getNotebookImageData = (
  notebook: NotebookKind,
  images: ImageStreamKind[],
): NotebookImageData[0] => {
  const container: PodContainer | undefined = notebook.spec.template.spec.containers.find(
    (currentContainer) => currentContainer.name === notebook.metadata.name,
  );
  const imageTag = container?.image.split('/').at(-1)?.split(':');

  // if image could not be parsed from the container, consider it deleted because the image tag is invalid
  if (!imageTag || imageTag.length < 2 || !container) {
    return {
      imageAvailability: NotebookImageAvailability.DELETED,
    };
  }

  const [imageName, versionName] = imageTag;
  const [lastImageSelectionName, lastImageSelectionTag] =
    notebook.metadata.annotations?.['notebooks.opendatahub.io/last-image-selection']?.split(':') ??
    [];

  const notebookImageInternalRegistry = getNotebookImageInternalRegistry(
    notebook,
    images,
    imageName,
    versionName,
  );
  if (
    notebookImageInternalRegistry &&
    notebookImageInternalRegistry.imageAvailability !== NotebookImageAvailability.DELETED
  ) {
    return notebookImageInternalRegistry;
  }
  const notebookImageNoInternalRegistry = getNotebookImageNoInternalRegistry(
    notebook,
    images,
    lastImageSelectionName,
    container.image,
  );
  if (
    notebookImageNoInternalRegistry &&
    notebookImageNoInternalRegistry.imageAvailability !== NotebookImageAvailability.DELETED
  ) {
    return notebookImageNoInternalRegistry;
  }
  const notebookImageNoInternalRegistryNoSHA = getNotebookImageNoInternalRegistryNoSHA(
    notebook,
    images,
    lastImageSelectionTag,
    container.image,
  );
  if (
    notebookImageNoInternalRegistryNoSHA &&
    notebookImageNoInternalRegistryNoSHA.imageAvailability !== NotebookImageAvailability.DELETED
  ) {
    return notebookImageNoInternalRegistryNoSHA;
  }
  return {
    imageAvailability: NotebookImageAvailability.DELETED,
    imageDisplayName:
      notebookImageInternalRegistry?.imageDisplayName ||
      notebookImageNoInternalRegistry?.imageDisplayName ||
      notebookImageNoInternalRegistryNoSHA?.imageDisplayName,
  };
};

const useNotebookImageData = (notebook?: NotebookKind): NotebookImageData => {
  const { dashboardNamespace } = useNamespaces();
  const [images, loaded, loadError] = useImageStreams(dashboardNamespace, true);

  return React.useMemo(() => {
    if (!loaded || !notebook) {
      return [null, false, loadError];
    }
    const data = getNotebookImageData(notebook, images);

    if (data === null) {
      return [null, false, loadError];
    }

    return [data, true, undefined];
  }, [images, notebook, loaded, loadError]);
};

const getNotebookImageInternalRegistry = (
  notebook: NotebookKind,
  images: ImageStreamKind[],
  imageName: string,
  versionName: string,
): NotebookImageData[0] => {
  const imageStream = images.find((image) => image.metadata.name === imageName);

  return getImageDisplayName(imageStream, notebook, versionName);
};

const getNotebookImageNoInternalRegistry = (
  notebook: NotebookKind,
  images: ImageStreamKind[],
  lastImageSelectionName: string,
  containerImage: string,
): NotebookImageData[0] => {
  const imageStream = images.find(
    (image) =>
      image.metadata.name === lastImageSelectionName &&
      image.spec.tags?.find((version) => version.from?.name === containerImage),
  );

  return getImageDisplayName(imageStream, notebook, containerImage);
};

const getNotebookImageNoInternalRegistryNoSHA = (
  notebook: NotebookKind,
  images: ImageStreamKind[],
  lastImageSelectionTag: string,
  containerImage: string,
): NotebookImageData[0] => {
  const imageStream = images.find((image) =>
    image.status?.tags?.find(
      (version) =>
        version.tag === lastImageSelectionTag &&
        version.items?.find((item) => item.dockerImageReference === containerImage),
    ),
  );

  return getImageDisplayName(imageStream, notebook, lastImageSelectionTag);
};

const getImageDisplayName = (
  imageStream: ImageStreamKind | undefined,
  notebook: NotebookKind,
  versionName: string,
): NotebookImageData[0] => {
  if (!imageStream) {
    // Get the image display name from the notebook metadata if we can't find the image stream. (this is a fallback and could still be undefined)
    const imageDisplayName = notebook.metadata.annotations?.['opendatahub.io/image-display-name'];

    return {
      imageAvailability: NotebookImageAvailability.DELETED,
      imageDisplayName,
    };
  }
  const versions = imageStream.spec.tags || [];
  const imageVersion = versions.find((version) => version.name === versionName);
  const imageDisplayName = getImageStreamDisplayName(imageStream);
  if (!imageVersion) {
    return {
      imageAvailability: NotebookImageAvailability.DELETED,
      imageDisplayName,
    };
  }

  return returnImageData(imageStream, imageVersion, imageDisplayName);
};

const returnImageData = (
  imageStream: ImageStreamKind,
  imageVersion: any,
  imageDisplayName: string,
): NotebookImageData[0] => {
  return {
    imageStream,
    imageVersion,
    imageAvailability:
      imageStream.metadata.labels?.['opendatahub.io/notebook-image'] === 'true'
        ? NotebookImageAvailability.ENABLED
        : NotebookImageAvailability.DISABLED,
    imageDisplayName,
  };
};

export default useNotebookImageData;
