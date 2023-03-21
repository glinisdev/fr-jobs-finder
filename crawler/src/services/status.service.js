import { Status } from '../models/status.model.js'

export async function createStatuses () {
  const portals = [
    {
      portal: 'upwork',
      numberOfCrawledJobs: 0
    },
    {
      portal: 'fiverr',
      numberOfCrawledJobs: 0
    }
  ]

  for (const portal of portals) {
    await Status.updateOne(
      { portal: portal.portal },
      { $setOnInsert: portal },
      { upsert: true }
    )
  }
}
