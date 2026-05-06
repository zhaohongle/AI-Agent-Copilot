import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { CronJob } from '../types'

const OPENCLAW_ROOT = process.env.OPENCLAW_ROOT || `${process.env.HOME}/.openclaw`
const CRON_JOBS_PATH = path.join(OPENCLAW_ROOT, 'cron', 'jobs.json')
const FALLBACK_PATHS = [
  CRON_JOBS_PATH,
  path.join(OPENCLAW_ROOT, 'data', 'cron.json'),
  path.join(OPENCLAW_ROOT, 'cron.json'),
]

interface RawCronJob {
  id?: string
  name?: string
  // Legacy flat fields
  schedule?: string | { kind?: string; expr?: string; everyMs?: number; at?: string; tz?: string }
  cron?: string
  nextRun?: string
  next_run?: string
  status?: string
  enabled?: boolean
  lastRun?: string
  last_run?: string
  // Real OpenClaw fields
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    lastDurationMs?: number
    lastError?: string
  }
  description?: string
  agentId?: string
}

function parseCronFromCommand(): CronJob[] {
  try {
    const output = execSync('openclaw cron list --json', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore']
    })
    const data = JSON.parse(output)
    return normalizeCronJobs(Array.isArray(data) ? data : [data])
  } catch {
    return []
  }
}

function parseCronFromFile(): CronJob[] {
  for (const filePath of FALLBACK_PATHS) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)
        // Support { version, jobs: [...] } format (real OpenClaw cron/jobs.json)
        const rawJobs = data.jobs ? data.jobs : (Array.isArray(data) ? data : [data])
        return normalizeCronJobs(rawJobs)
      }
    } catch {
      continue
    }
  }
  return []
}

function normalizeCronJobs(raw: RawCronJob[]): CronJob[] {
  return raw
    .filter(job => job && (job.name || job.id))
    .map((job, index) => {
      // Parse schedule expression
      let scheduleStr = '*/5 * * * *'
      if (typeof job.schedule === 'string') {
        scheduleStr = job.schedule
      } else if (job.schedule && typeof job.schedule === 'object') {
        scheduleStr = job.schedule.expr || (job.schedule.everyMs ? `every ${job.schedule.everyMs}ms` : scheduleStr)
      } else if (job.cron) {
        scheduleStr = job.cron
      }

      // Parse nextRun from real state.nextRunAtMs
      const nextRunMs = job.state?.nextRunAtMs
      const lastRunMs = job.state?.lastRunAtMs
      const nextRun = nextRunMs
        ? new Date(nextRunMs).toISOString()
        : (job.nextRun || job.next_run || new Date(Date.now() + 5 * 60000).toISOString())
      const lastRun = lastRunMs
        ? new Date(lastRunMs).toISOString()
        : (job.lastRun || job.last_run)

      return {
        id: job.id || `cron_${index}`,
        name: job.name || job.id || `Cron Job ${index + 1}`,
        schedule: scheduleStr,
        nextRun,
        status: (job.status === 'active' || job.enabled === true) ? 'active' : 'paused',
        lastRun
      }
    })
}

export function collectCronJobs(): CronJob[] {
  // Try command first
  let jobs = parseCronFromCommand()

  // Fallback to file
  if (jobs.length === 0) {
    jobs = parseCronFromFile()
  }

  // Return empty array if no data (don't throw)
  return jobs
}
