import * as React from 'react';
import {
  Alert,
  Button,
  FormGroup,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { UpdateObjectAtPropAndValue } from 'pages/projects/types';
import { CreatingModelServerObject, ModelServerToken } from '../types';
import { ExclamationCircleIcon, MinusCircleIcon } from '@patternfly/react-icons';

type ModelServerTokenInputProps = {
  data: CreatingModelServerObject;
  setData: UpdateObjectAtPropAndValue<CreatingModelServerObject>;
  token: ModelServerToken;
};

const ModelServerTokenInput: React.FC<ModelServerTokenInputProps> = ({ data, setData, token }) => {
  const checkDuplicates = (name: string): boolean => {
    const duplicates = data.tokens.filter((token) => token.name === name);
    return duplicates.length > 0;
  };

  const checkValid = (value: string) => {
    if (value.length === 0) {
      return 'Required';
    } else if (!/^[a-z-]+$/.test(value)) {
      return 'Must only consist of lower case letters and dashes';
    } else if (checkDuplicates(value)) {
      return 'Duplicates are invalid';
    } else {
      return '';
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup
          label="Token secret"
          helperText="Enter the service account name for which the token will be generated"
          helperTextInvalid={token.error}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          validated={token.error ? ValidatedOptions.error : ValidatedOptions.default}
        >
          <Split>
            <SplitItem isFilled>
              <TextInput
                value={token.name}
                isRequired
                type="text"
                id="simple-form-name-01"
                name="simple-form-name-01"
                aria-describedby="simple-form-name-01-helper"
                validated={token.error ? ValidatedOptions.error : ValidatedOptions.default}
                onChange={(value) => {
                  const tokens = data.tokens?.map((item) =>
                    item.uuid === token.uuid
                      ? { uuid: token.uuid, name: value, error: checkValid(value) }
                      : item,
                  );
                  setData('tokens', tokens);
                }}
              />
            </SplitItem>
            <SplitItem>
              <Button
                variant="plain"
                icon={<MinusCircleIcon />}
                onClick={() => {
                  setData(
                    'tokens',
                    data.tokens.filter((item) => item.uuid !== token.uuid),
                  );
                }}
              />
            </SplitItem>
          </Split>
        </FormGroup>
      </StackItem>
      <StackItem>
        <Alert
          variant="info"
          isInline
          title="The actual token will be created and displayed when the model server is configured."
        />
      </StackItem>
    </Stack>
  );
};

export default ModelServerTokenInput;
