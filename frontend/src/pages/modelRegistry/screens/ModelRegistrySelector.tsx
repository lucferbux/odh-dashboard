import * as React from 'react';
import {
  SelectVariant,
  Select,
  SelectGroup,
  SelectOption,
} from '@patternfly/react-core/deprecated';
import { useNavigate } from 'react-router';
import { Bullseye, Flex, FlexItem } from '@patternfly/react-core';
import { useBrowserStorage } from '~/components/browserStorage';
import { ModelRegistrySelectorContext } from '~/concepts/modelRegistry/context/ModelRegistrySelectorContext';
import { ProjectObjectType, typedObjectImage } from '~/concepts/design/utils';

const MODEL_REGISTRY_FAVORITE_STORAGE_KEY = 'odh.dashboard.model.registry.favorite';

const ModelRegistrySelector: React.FC = () => {
  const { modelRegistries, preferredModelRegistry, updatePreferredModelRegistry } =
    React.useContext(ModelRegistrySelectorContext);
  const [favorites, setFavorites] = useBrowserStorage<string[]>(
    MODEL_REGISTRY_FAVORITE_STORAGE_KEY,
    [],
  );
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = React.useState(false);

  const options = [
    <SelectGroup label="Select a model registry" key="all">
      {modelRegistries.map((modelRegistry) => (
        <SelectOption
          id={modelRegistry.metadata.name}
          key={modelRegistry.metadata.name}
          value={modelRegistry.metadata.name}
          isFavorite={favorites.includes(modelRegistry.metadata.name)}
        />
      ))}
    </SelectGroup>,
  ];

  const selector = (
    <Select
      data-testid="model-registry-selector-dropdown"
      variant={SelectVariant.single}
      onToggle={() => setIsOpen(!isOpen)}
      isDisabled={modelRegistries.length === 0}
      onSelect={(_e, value) => {
        setIsOpen(false);
        updatePreferredModelRegistry(modelRegistries.find((obj) => obj.metadata.name === value));
        navigate(`/modelRegistry/${value}`);
      }}
      selections={preferredModelRegistry?.metadata.name}
      isOpen={isOpen}
      isGrouped
      onFavorite={(itemId, isFavorite) => {
        if (isFavorite) {
          setFavorites(favorites.filter((id) => id !== itemId));
        } else {
          setFavorites([...favorites, itemId]);
        }
      }}
      favorites={favorites}
    >
      {options}
    </Select>
  );

  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <img
        src={typedObjectImage(ProjectObjectType.project)}
        alt=""
        style={{ height: 'var(--pf-v5-global--icon--FontSize--lg)' }}
      />
      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <Bullseye>Model registry</Bullseye>
        </FlexItem>
        <FlexItem>{selector}</FlexItem>
      </Flex>
    </Flex>
  );
};

export default ModelRegistrySelector;
