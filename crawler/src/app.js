import { crawlUpworkJobs } from './services/index.js'
import { Cron } from 'croner'
import { connect } from './config/db.config.js'

connect()

const job = Cron('*/1 * * * *', async () => {
	console.log('starting cron job...')
  await crawlUpworkJobs()
})
