import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowUpRight, Play } from 'lucide-react';
import { useRepositories, useTaskEvents } from '../hooks/useTask.js';
import { taskApi } from '../api/taskApi.js';
import { useSessionRequest } from '../../../shared/hooks/useSessionRequest.js';
import { errorMessage } from '../../../shared/api/http.js';
import { PageHeading } from '../../../shared/ui/PageHeading.jsx';
import { ErrorNotice } from '../../../shared/ui/ErrorNotice.jsx';

function NewTask() {
  const { repositories, loading, error: repoError, reload } = useRepositories();
  const request = useSessionRequest();
  const navigate = useNavigate();
  const [repoId, setRepoId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const submit = async event => {
    event.preventDefault();
    const repo = repositories.find(item => String(item.id) === repoId);
    if (!repo) { setError('Choose an accessible repository.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const task = await request(token => taskApi.create(token, {
        userInput, repo: { id: repo.id, htmlUrl: repo.htmlUrl },
      }));
      navigate(`/tasks/${task.id}`);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };
  return <>
    <PageHeading eyebrow="CLOUD AGENT" title="What would you like to build?" description="Choose a connected repository. Your agent will implement, verify, and open a pull request." />
    <ErrorNotice message={repoError} onRetry={reload} />
    <ErrorNotice message={error} />
    <form className="panel task-form" onSubmit={submit}>
      <label htmlFor="task-repo">GitHub repository</label>
      <select id="task-repo" required value={repoId} onChange={event => setRepoId(event.target.value)} disabled={loading || submitting}>
        <option value="">{loading ? 'Loading repositories...' : 'Select a repository'}</option>
        {repositories.map(repo => <option key={repo.id} value={repo.id}>{repo.fullName}{repo.private ? ' (private)' : ''}</option>)}
      </select>
      {!loading && !repoError && !repositories.length && <p>No repositories are available. <Link className="text-link" to="/connection">Check your GitHub connection</Link></p>}
      <label htmlFor="task-input">Your instructions</label>
      <textarea id="task-input" required minLength={1} maxLength={20000} rows={8} value={userInput} disabled={submitting} onChange={event => setUserInput(event.target.value)} placeholder="Describe the change you want the cloud agent to make..." />
      <p>The workspace is temporary. Successful changes are saved in a PR; failures are reported in the task log.</p>
      <button className="button button-primary" disabled={submitting || loading || !repoId || !userInput.trim()}><Play size={15} />{submitting ? 'Creating task...' : 'Start task'}</button>
    </form>
  </>;
}

function TaskRun({ taskId }) {
  const { task, events, error, connected } = useTaskEvents(taskId);
  return <>
    <PageHeading eyebrow="CLOUD AGENT" title={task ? `Task ${task.status}` : 'Connecting to your task...'} description={task?.repo.fullName || 'Your live agent event stream'}>
      <Link to="/tasks" className="button button-secondary">New task</Link>
    </PageHeading>
    <ErrorNotice message={error} />
    {task && <section className="panel task-summary">
      <p>{task.userInput}</p>
      <small>Task ID: {task.id}</small>
      {task.error && <ErrorNotice message={task.error} />}
      {task.pullRequestUrl && <a className="button button-primary" href={task.pullRequestUrl} target="_blank" rel="noreferrer">View pull request<ArrowUpRight size={15} /></a>}
    </section>}
    <section className="panel mt-6">
      <div className="panel-heading"><h2>Agent events</h2><span className="count-badge">{connected ? 'LIVE' : ['completed', 'failed'].includes(task?.status) ? 'FINISHED' : 'CONNECTING'}</span></div>
      <div className="task-log" role="log" aria-label="Agent task events">
        {!events.length && <p>Waiting for task events...</p>}
        {events.map(event => <article key={event.id}>
          <strong>{event.data.agent || 'system'}{event.data.type ? ` / ${event.data.type}` : ''}</strong>
          <pre>{typeof event.data.message === 'string' ? event.data.message : JSON.stringify(event.data.content ?? event.data, null, 2)}</pre>
        </article>)}
      </div>
      <p className="panel-footnote">Showing the latest 1,000 received events. Logs remain in Redis for seven days after the task finishes. Bookmark this page to return.</p>
    </section>
  </>;
}

export function TaskPage() {
  const { taskId } = useParams();
  return taskId ? <TaskRun key={taskId} taskId={taskId} /> : <NewTask />;
}
