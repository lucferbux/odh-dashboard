import * as React from 'react';
import { FormGroup, FormSection, NumberInput, Select, SelectOption } from '@patternfly/react-core';
import { UpdateObjectAtPropAndValue } from 'pages/projects/types';
import { CreatingModelServerObject, ModelServerSize } from '../types';
import ModelServerSizeExpandedField from './ModelServerSizeExpandedField';

type ModelServerSizeSectionProps = {
  data: CreatingModelServerObject;
  setData: UpdateObjectAtPropAndValue<CreatingModelServerObject>;
  sizes: ModelServerSize[];
};

const ModelServerSizeSection: React.FC<ModelServerSizeSectionProps> = ({
  data,
  setData,
  sizes,
}) => {
  const [sizeDropdownOpen, setSizeDropdownOpen] = React.useState<boolean>(false);

  const onChangeGPU = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setData('gpus', parseInt(target.value));
  };

  const sizeCustom = [
    ...sizes,
    {
      name: 'Custom',
      resources: sizes[0].resources,
    },
  ];

  const sizeOptions = () =>
    sizeCustom.map((size) => {
      const name = size.name;
      const desc =
        name !== 'Custom'
          ? `Limits: ${size.resources.limits?.cpu || '??'} CPU, ` +
            `${size.resources.limits?.memory || '??'} Memory ` +
            `Requests: ${size.resources.requests?.cpu || '??'} CPU, ` +
            `${size.resources.requests?.memory || '??'} Memory`
          : '';
      return <SelectOption key={name} value={name} description={desc} />;
    });

  return (
    <FormSection title="Compute resources per replica">
      <FormGroup label="Model server size">
        <Select
          id="model-server-size-selection"
          isOpen={sizeDropdownOpen}
          placeholderText="Select a model server size"
          onToggle={(open) => setSizeDropdownOpen(open)}
          onSelect={(_, option) => {
            const valuesSelected = sizeCustom.find((element) => element.name === option);
            if (valuesSelected) {
              setData('modelSize', valuesSelected);
            }
            setSizeDropdownOpen(false);
          }}
          selections={data.modelSize.name}
        >
          {sizeOptions()}
        </Select>
        {data.modelSize.name === 'Custom' && (
          <ModelServerSizeExpandedField data={data} setData={setData} />
        )}
      </FormGroup>
      <FormGroup label="Number of GPUs (Not implemented)">
        <NumberInput
          isDisabled
          value={data.gpus}
          widthChars={10}
          min={0}
          onChange={onChangeGPU}
          onMinus={() => setData('gpus', data.gpus - 1)}
          onPlus={() => setData('gpus', data.gpus + 1)}
        />
      </FormGroup>
    </FormSection>
  );
};

export default ModelServerSizeSection;