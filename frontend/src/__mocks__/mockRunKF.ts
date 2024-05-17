/* eslint-disable camelcase */
import { PipelineRunKFv2, RuntimeStateKF, StorageStateKF } from '~/concepts/pipelines/kfTypes';

export const buildMockRunKF = (run?: Partial<PipelineRunKFv2>): PipelineRunKFv2 => ({
  experiment_id: '1a1a1e71-25b6-46b6-a9eb-6ff1d8518be9',
  run_id: '17577391-357e-489f-b88a-f0f8895d5376',
  display_name: 'Test run',
  storage_state: StorageStateKF.AVAILABLE,
  pipeline_version_reference: {
    pipeline_id: 'f962f8b4-8a56-4499-9907-1eb7c407a8ff',
    pipeline_version_id: '90f05f62-36e6-4fb3-a769-da977a468273',
  },
  runtime_config: { parameters: { min_max_scaler: false, neighbors: 1, standard_scaler: false } },
  service_account: 'pipeline-runner-dspa',
  created_at: '2024-03-15T17:59:35Z',
  scheduled_at: '2024-03-15T17:59:35Z',
  finished_at: '2024-03-15T18:00:25Z',
  state: RuntimeStateKF.SUCCEEDED,
  run_details: {
    task_details: [
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '0891c2b7-7ea6-4c75-8254-24f9c736e837',
        display_name: 'train-model',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:25Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-4001010741' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '141d6424-59db-4d9d-86e9-98e1a811e453',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:05Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SKIPPED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3692705603' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '16123c45-5b1b-458c-b4d9-afa6dc3e4887',
        display_name: 'normalize-dataset-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:10Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-928724422' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '1d62e55b-ea12-4f27-8b60-b35b007a7812',
        display_name: 'train-model-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:20Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3775069846' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '4dd95b59-bd8f-4562-bfc3-e52fffe0c560',
        display_name: 'iris-training-pipeline-v4zp7',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:35Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:36Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2780559103' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '5e9ea183-6817-432c-9ee3-bd27013ae3fa',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:15Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SKIPPED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-4101678931' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '6c5d570a-7b88-4053-80d8-add0463d7bf8',
        display_name: 'executor',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:25Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SKIPPED,
        state_history: [{ update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SKIPPED }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: '877af71a-07f6-4d15-b3a2-c771b2876996',
        display_name: 'root',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:55Z',
        end_time: '2024-03-15T18:00:25Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T18:00:26Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3569115838' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'a65b8683-0fb7-4103-83ca-0a5f16641ebc',
        display_name: 'create-dataset',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:05Z',
        end_time: '2024-03-15T18:00:05Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2757091352' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'b0873f0c-8435-4bb3-a9d0-27ac1668d562',
        display_name: 'create-dataset-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:55Z',
        end_time: '2024-03-15T17:59:59Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T18:00:06Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-3312624493' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'c1b54b9c-9cfd-449d-b425-792849564f72',
        display_name: 'root-driver',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T17:59:35Z',
        end_time: '2024-03-15T17:59:42Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [
          { update_time: '2024-03-15T17:59:36Z', state: RuntimeStateKF.PENDING },
          { update_time: '2024-03-15T17:59:46Z', state: RuntimeStateKF.RUNNING },
          { update_time: '2024-03-15T17:59:56Z', state: RuntimeStateKF.SUCCEEDED },
        ],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-1033443722' }],
      },
      {
        run_id: '17577391-357e-489f-b88a-f0f8895d5376',
        task_id: 'e94ce91f-ba15-45d6-9d00-6be83ab36ce7',
        display_name: 'normalize-dataset',
        create_time: '2024-03-15T17:59:35Z',
        start_time: '2024-03-15T18:00:15Z',
        end_time: '2024-03-15T18:00:15Z',
        state: RuntimeStateKF.SUCCEEDED,
        state_history: [{ update_time: '2024-03-15T18:00:16Z', state: RuntimeStateKF.SUCCEEDED }],
        child_tasks: [{ pod_name: 'iris-training-pipeline-v4zp7-2244644869' }],
      },
    ],
  },
  state_history: [
    { update_time: '2024-03-15T17:59:35Z', state: 'PENDING' },
    { update_time: '2024-03-15T17:59:36Z', state: 'RUNNING' },
    { update_time: '2024-03-15T18:00:26Z', state: 'SUCCEEDED' },
  ],
  ...run,
});