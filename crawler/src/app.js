import { crawlUpworkJobs } from './services/index.js'
import { CronJob } from 'cron'
import { connect } from './config/db.config.js'

connect()

const job = new CronJob('*/1 * * * *', async () => {
  console.log('starting cron job...')
  await crawlUpworkJobs()
  job.stop()
}, undefined, true)
