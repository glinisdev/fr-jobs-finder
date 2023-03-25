import { crawlUpworkJobs } from './services/index.js'
import { CronJob } from 'cron'
import { connect } from './config/db.config.js'

connect()

// eslint-disable-next-line no-new
new CronJob('*/1 * * * *', async () => {
  console.log('starting cron job...')
  await crawlUpworkJobs()
}, undefined, true)
