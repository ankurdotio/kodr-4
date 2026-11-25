import { BatchV1Api, CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let clients;
function getClients() {
  if (!process.env.KUBERNETES_SERVICE_HOST) throw new AppError(503, 'Task scheduling requires in-cluster Kubernetes access');
  if (!clients) {
    const config = new KubeConfig();
    config.loadFromCluster();
    clients = { jobs: config.makeApiClient(BatchV1Api), core: config.makeApiClient(CoreV1Api) };
  }
  return clients;
}

export const taskJobName = id => `task-${id}`;
const secretEnv = (name, secret, key) => ({ name, valueFrom: { secretKeyRef: { name: secret, key } } });
const valueEnv = (name, value) => ({ name, value: String(value) });

export function buildTaskJob(task) {
  const name = taskJobName(task._id);
  const commonEnv = [
    valueEnv('TASK_ID', task._id), valueEnv('TASK_MODE', 'job'),
    valueEnv('WORKSHOP_DIR', '/workshop/repository'),
    valueEnv('REPO_HTML_URL', task.repo.htmlUrl), valueEnv('REPO_FULL_NAME', task.repo.fullName),
    valueEnv('REPO_BASE_BRANCH', task.repo.defaultBranch),
    secretEnv('REDIS_URL', name, 'redisUrl'),
  ];
  const githubEnv = secretEnv('GITHUB_TOKEN', name, 'githubToken');
  const securityContext = {
    allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, capabilities: { drop: ['ALL'] },
  };
  const workspace = { name: 'workshop', mountPath: '/workshop' };
  return {
    apiVersion: 'batch/v1', kind: 'Job',
    metadata: { name, labels: { app: 'cloud-agent-task', 'task-id': String(task._id) } },
    spec: {
      backoffLimit: 0, activeDeadlineSeconds: 2400,
      template: {
        metadata: { labels: { app: 'cloud-agent-task', 'task-id': String(task._id) } },
        spec: {
          restartPolicy: 'Never', serviceAccountName: 'cloud-agent-task', automountServiceAccountToken: false,
          terminationGracePeriodSeconds: 15,
          securityContext: { runAsNonRoot: true, runAsUser: 1000, runAsGroup: 1000, fsGroup: 1000, seccompProfile: { type: 'RuntimeDefault' } },
          volumes: [
            { name: 'workshop', emptyDir: { sizeLimit: '2Gi' } },
            { name: 'task-metadata', emptyDir: {} },
            { name: 'clone-tmp', emptyDir: {} }, { name: 'agent-tmp', emptyDir: {} },
            { name: 'workshop-tmp', emptyDir: {} },
          ],
          initContainers: [
            {
              name: 'clone', image: env.taskAgentImage, imagePullPolicy: 'IfNotPresent',
              command: ['node', 'src/task/clone.js'], env: [...commonEnv, githubEnv], securityContext,
              volumeMounts: [workspace, { name: 'clone-tmp', mountPath: '/tmp' }, { name: 'task-metadata', mountPath: '/task' }],
              resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '1', memory: '512Mi' } },
            },
            {
              name: 'workshop', image: env.taskWorkshopImage, imagePullPolicy: 'IfNotPresent',
              restartPolicy: 'Always', command: ['node', '/server/src/server.js'],
              env: [valueEnv('WORKSHOP_DIR', '/workshop/repository')], securityContext,
              startupProbe: {
                exec: { command: ['node', '-e', "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"] },
                periodSeconds: 2, failureThreshold: 30,
              },
              volumeMounts: [workspace, { name: 'workshop-tmp', mountPath: '/tmp' }],
              resources: { requests: { cpu: '250m', memory: '256Mi' }, limits: { cpu: '2', memory: '2Gi' } },
            },
          ],
          containers: [{
            name: 'agent', image: env.taskAgentImage, imagePullPolicy: 'IfNotPresent',
            command: ['node', 'main.js'], securityContext,
            env: [
              ...commonEnv, githubEnv, valueEnv('TASK_INPUT', task.userInput),
              valueEnv('WORKSHOP_SERVER_URL', 'http://127.0.0.1:4000'),
              ...['COHERE_API_KEY', 'NVIDIA_API_KEY'].map(key => ({
                name: key, valueFrom: { secretKeyRef: { name: 'cloud-agent-task-runtime', key, optional: true } },
              })),
            ],
            volumeMounts: [workspace, { name: 'agent-tmp', mountPath: '/tmp' }, { name: 'task-metadata', mountPath: '/task', readOnly: true }],
            resources: { requests: { cpu: '250m', memory: '512Mi' }, limits: { cpu: '2', memory: '2Gi' } },
          }],
        },
      },
    },
  };
}

export const taskJobs = {
  async create(task, token) {
    const { jobs, core } = getClients();
    const job = await jobs.createNamespacedJob({ namespace: env.taskNamespace, body: buildTaskJob(task) });
    await core.createNamespacedSecret({
      namespace: env.taskNamespace,
      body: {
        apiVersion: 'v1', kind: 'Secret', type: 'Opaque',
        metadata: {
          name: taskJobName(task._id),
          ownerReferences: [{ apiVersion: 'batch/v1', kind: 'Job', name: job.metadata.name, uid: job.metadata.uid }],
        },
        // Task pods write logs to the same Redis the backend streams from.
        stringData: { githubToken: token, redisUrl: env.redisUrl },
      },
    });
  },
  async read(id) {
    try {
      return await getClients().jobs.readNamespacedJob({ name: taskJobName(id), namespace: env.taskNamespace });
    } catch (error) {
      if (error.code === 404) return null;
      throw error;
    }
  },
  async delete(id) {
    try {
      await getClients().jobs.deleteNamespacedJob({
        name: taskJobName(id), namespace: env.taskNamespace, propagationPolicy: 'Foreground',
      });
    } catch (error) {
      if (error.code !== 404) throw error;
    }
  },
};
