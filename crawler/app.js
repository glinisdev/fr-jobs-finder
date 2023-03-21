import { upworkCrawler } from './services/upwork_crawler.js'
import { CronJob } from 'cron'

// eslint-disable-next-line no-new
new CronJob('*/1 * * * *', async () => {
  console.log('Start cron job')
  await upworkCrawler()
  // await fiverrCrawler()
}, undefined, true, 'America/Los_Angeles')
