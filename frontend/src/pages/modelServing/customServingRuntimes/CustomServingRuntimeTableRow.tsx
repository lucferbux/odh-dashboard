import * as React from 'react';
import { ActionsColumn, Td, Tr } from '@patternfly/react-table';
import { TemplateKind } from '~/k8sTypes';
import { TrDragFunctionsType } from '~/utilities/useDraggableTable';
import CustomServingRuntimeEnabledToggle from '~/pages/modelServing/customServingRuntimes/CustomServingRuntimeEnabledToggle';

type CustomServingRuntimeTableRowProps = {
  obj: TemplateKind;
  rowIndex: number;
  dragFunctions?: TrDragFunctionsType;
};

const CustomServingRuntimeTableRow: React.FC<CustomServingRuntimeTableRowProps> = ({
  obj: template,
  rowIndex,
  dragFunctions,
}) => {
  if (!dragFunctions) {
    return null;
  }
  const { onDragEnd, onDragStart, onDrop } = dragFunctions;
  return (
    <Tr
      key={rowIndex}
      id={template.metadata.name}
      draggable
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <Td
        draggableRow={{
          id: `draggable-row-${template.metadata.name}`,
        }}
      />
      <Td dataLabel="Name">{template.metadata.name}</Td>
      <Td dataLabel="Workbench">
        <CustomServingRuntimeEnabledToggle template={template} />
      </Td>
      <Td isActionCell>
        <ActionsColumn items={[]} />
      </Td>
    </Tr>
  );
};

export default CustomServingRuntimeTableRow;
