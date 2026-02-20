import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

const githubRequest = jest.fn<
  (...args: unknown[]) => Promise<{ data: { body: string } }>
>()
const fetchMock = jest.fn()

const githubContext = {
  payload: {
    pull_request: {
      html_url: 'https://github.com/acme/repo/pull/123',
      body: 'Task/Issue URL: https://app.asana.com/0/111111/222222/f'
    },
    issue: {
      title: 'A bug',
      body: 'Issue body',
      html_url: 'https://github.com/acme/repo/issues/456'
    }
  }
}

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => ({
  context: githubContext
}))
jest.unstable_mockModule('@octokit/core', () => ({
  Octokit: class {
    request = githubRequest
  }
}))

const { run } = await import('../src/main.js')

describe('main.ts action router', () => {
  const baseInputs: Record<string, string> = {
    action: 'create-asana-task',
    'asana-pat': 'pat-token',
    'asana-project': '111111',
    'asana-section': '',
    'asana-task-name': 'Task name',
    'asana-task-description': 'Task desc',
    'asana-task-id': '222222',
    'asana-task-comment': 'hello',
    'asana-task-comment-pinned': 'false',
    'asana-task-comment-is-html': 'false',
    'asana-tags': '',
    'asana-collaborators': '',
    'asana-assignee': 'user-1',
    'asana-task-assignee': '',
    'asana-task-custom-fields': '',
    'trigger-phrase': 'Task/Issue URL:',
    'is-complete': 'true',
    'is-pinned': 'false',
    'mattermost-token': 'mm-token',
    'mattermost-team-id': 'team',
    'mattermost-channel-name': 'release',
    'mattermost-message': 'hello world',
    'mattermost-url': 'https://chat.example.com',
    'github-pat': 'gh-pat',
    'github-org': 'acme',
    'github-repository': 'repo',
    'github-pr': '123'
  }

  function useInputs(overrides: Record<string, string> = {}): void {
    const merged = { ...baseInputs, ...overrides }
    core.getInput.mockImplementation((name: string) => merged[name] ?? '')
  }

  beforeEach(() => {
    jest.resetAllMocks()
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true
    })
    useInputs()

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/tasks') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: { gid: '333333' } })
        }
      }
      if (url.includes('/tasks/222222?opt_fields=')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              gid: '222222',
              permalink_url: 'https://app.asana.com/0/111111/222222/f',
              projects: [{ gid: '111111' }]
            }
          })
        }
      }
      if (url.includes('/tasks/222222') && !url.includes('?opt_fields=')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              gid: '222222',
              permalink_url: 'https://app.asana.com/0/111111/222222/f'
            }
          })
        }
      }
      if (url.includes('/projects/project-1/tasks')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              { gid: '222222', name: 'Task name' },
              { gid: '999999', name: 'Another task' }
            ]
          })
        }
      }
      if (url.includes('/teams/team/channels/name/release')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'channel-id' })
        }
      }
      if (url.includes('/api/v4/posts')) {
        return { ok: true, status: 201, json: async () => ({}) }
      }
      return { ok: true, status: 200, json: async () => ({ data: {} }) }
    })
    githubRequest.mockResolvedValue({ data: { body: 'Old PR body' } })
  })

  it('creates an Asana task and sets taskId output', async () => {
    await run()

    expect(fetchMock).toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalledWith('taskId', '333333')
    expect(core.setOutput).toHaveBeenCalledWith('duplicate', false)
  })

  it('finds Asana task ID from pull request body', async () => {
    useInputs({
      action: 'find-asana-task-id',
      'asana-project': ''
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('asanaTaskId', '222222')
  })

  it('finds multiple Asana task IDs from pull request body', async () => {
    useInputs({
      action: 'find-asana-task-ids',
      'asana-project': ''
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('asanaTaskIds', '222222')
  })

  it('assigns an Asana task', async () => {
    useInputs({
      action: 'assign-asana-task',
      'asana-task-id': '222222',
      'asana-assignee': 'user-2'
    })

    await run()

    expect(fetchMock).toHaveBeenCalled()
  })

  it('creates issue-based Asana task', async () => {
    useInputs({
      action: 'create-asana-issue-task'
    })

    await run()

    expect(fetchMock).toHaveBeenCalled()
  })

  it('posts comment to explicit Asana task IDs', async () => {
    useInputs({
      action: 'post-comment-asana-task',
      'asana-task-id': '222222,333333',
      'asana-task-comment': 'Deployed',
      'asana-task-comment-pinned': 'true'
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('gets Asana task permalink', async () => {
    useInputs({
      action: 'get-asana-task-permalink',
      'asana-task-id': '222222'
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'asanaTaskPermalink',
      'https://app.asana.com/0/111111/222222/f'
    )
  })

  it('marks Asana task complete', async () => {
    useInputs({
      action: 'mark-asana-task-complete',
      'asana-task-id': '222222',
      'is-complete': 'true'
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('searches Asana task by exact name', async () => {
    useInputs({
      action: 'search-asana-task-by-name',
      'asana-project': 'project-1',
      'asana-task-name': 'Task name'
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('asanaTaskId', '222222')
    expect(core.setOutput).toHaveBeenCalledWith('asanaTaskIds', '222222')
  })

  it('adds PR link as comment to Asana task', async () => {
    useInputs({
      action: 'add-asana-comment',
      'asana-project': ''
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('notifies Asana task on PR approved', async () => {
    useInputs({
      action: 'notify-pr-approved',
      'asana-project': ''
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('notifies Asana task on PR merged', async () => {
    useInputs({
      action: 'notify-pr-merged',
      'asana-project': '',
      'is-complete': 'true'
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('adds Asana task to project and section', async () => {
    useInputs({
      action: 'add-task-asana-project',
      'asana-project': '111111',
      'asana-section': 'section-1',
      'asana-task-id': '222222'
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('adds Asana task URL to pull request description', async () => {
    useInputs({
      action: 'add-task-pr-description',
      'github-org': 'acme',
      'github-repository': 'repo',
      'github-pr': '123',
      'asana-project': '111111',
      'asana-task-id': '222222'
    })
    githubRequest
      .mockResolvedValueOnce({ data: { body: 'Old PR body' } })
      .mockResolvedValueOnce({ data: { body: 'updated' } })

    await run()

    expect(githubRequest).toHaveBeenCalledTimes(2)
  })

  it('sends Mattermost message', async () => {
    useInputs({
      action: 'send-mattermost-message',
      'mattermost-token': 'token',
      'mattermost-team-id': 'team',
      'mattermost-channel-name': 'release',
      'mattermost-message': 'Hello'
    })

    await run()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v4/teams/team/channels/name/release'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v4/posts'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('fails when action is unknown', async () => {
    core.getInput.mockImplementation((name: string) =>
      name === 'action' ? 'unknown-action' : ''
    )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Unexpected action: unknown-action'
    )
  })
})
