import * as React from 'react';
import { Grid, GridItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { Divider } from '@patternfly/react-core/components';
import { PipelineRunTask } from '~/k8sTypes';
import TaskDetailsSection from '~/concepts/pipelines/content/pipelinesDetails/taskDetails/TaskDetailsSection';
import TaskDetailsCodeBlock from '~/concepts/pipelines/content/pipelinesDetails/taskDetails/TaskDetailsCodeBlock';
import TaskDetailsParams from '~/concepts/pipelines/content/pipelinesDetails/taskDetails/TaskDetailsParams';

type TaskDetailsProps = {
  task: PipelineRunTask;
};

const PipelineTaskDetails: React.FC<TaskDetailsProps> = ({ task }) => (
  <Stack hasGutter>
    {task.params && <TaskDetailsParams params={task.params} />}
    {task.taskSpec.results && (
      <StackItem>
        <TaskDetailsSection title="Output parameters">
          <Grid hasGutter>
            {task.taskSpec.results.map((result, i) => (
              <React.Fragment key={`result-${i}`}>
                <GridItem span={4}>{result.name}</GridItem>
                <GridItem span={8}>{result.description}</GridItem>
              </React.Fragment>
            ))}
          </Grid>
        </TaskDetailsSection>
      </StackItem>
    )}
    {task.taskSpec.steps.map((step) => (
      <React.Fragment key={step.name}>
        {task.taskSpec.steps.length > 1 && (
          <StackItem>
            <Title headingLevel="h3" size="lg">
              Step {step.name}
            </Title>
            <Divider />
          </StackItem>
        )}
        <StackItem>
          <TaskDetailsSection title="Arguments">
            <TaskDetailsCodeBlock id="args" content={step.args.join('\n')} />
          </TaskDetailsSection>
        </StackItem>
        <StackItem>
          <TaskDetailsSection title="Command">
            <TaskDetailsCodeBlock id="command" content={step.command.join('\n')} />
          </TaskDetailsSection>
        </StackItem>
        <StackItem>
          <TaskDetailsSection title="Image">{step.image}</TaskDetailsSection>
        </StackItem>
      </React.Fragment>
    ))}
    <StackItem>&nbsp;</StackItem>
  </Stack>
);

export default PipelineTaskDetails;