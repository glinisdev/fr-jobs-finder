import axios from 'axios'
import { load } from 'cheerio'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer'
import fetch from 'cross-fetch'
import { Status } from '../models/status.model.js'
import { Job } from '../models/job.model.js'

export async function crawlUpworkJobs () {
  try {
    puppeteer.use(StealthPlugin())
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

    const browser = await puppeteer.launch({
      args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    })

    const page = await browser.newPage()

    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInPage(page)
    })

    if (browser) { console.log('Connected to browser') }

    const crawledJobs = []

    const links = [
      'https://www.upwork.com/search/jobs/?sort=recency',
      'https://www.upwork.com/nx/jobs/search/?sort=recency&page=2',
      'https://www.upwork.com/nx/jobs/search/?sort=recency&page=3',
      'https://www.upwork.com/nx/jobs/search/?sort=recency&page=4',
      'https://www.upwork.com/nx/jobs/search/?sort=recency&page=5'
    ]

    for (const webLink of links) {
      await page.goto(webLink)
      console.log(webLink)

      await page.waitForTimeout(2000)

      const elementSelector = '[id^="job-"]'
      const elements = await page.$$eval(elementSelector, (uiElements) => {
        return uiElements.map((uiElement) => uiElement.innerHTML)
      })

      for (const element of elements) {
        const htmlString = element

        const $ = load(htmlString)

        const title = $('h3 a').text().toLowerCase()

        const existingJob = await Job.findOne({ title })

        if (!existingJob && !title.includes('do not apply')) {
          const link = 'https://www.upwork.com' + $('h3 a').attr('href')
          const description = $('.up-line-clamp-v2.clamped').text().toLowerCase()
          const skills = $('.up-skill-wrapper .up-skill-badge').map((i, el) => $(el).text()).get()
          const jobType = $('[data-test="job-type"]').text()
          const contractorTier = $('[data-test="contractor-tier"]').text()
          const budget = $('[data-test="budget"]').text().replace(/[^0-9]/g, '')
          const duration = $('[data-test="duration"]').text()
          const postedTime = $('[data-test="UpCRelativeTime"]').text()

          const jobObject = {
            title,
            link,
            description,
            skills,
            jobType,
            contractorTier,
            budget,
            duration,
            postedTime
          }

          crawledJobs.push(jobObject)
        } else { console.log('Skipped') }
      }
    }

    await Job.insertMany(crawledJobs)
    console.log(`successfully crawled at ${new Date()}`)

    await browser.close()

    const crawledJobsNumber = crawledJobs.length

    await Status.findOneAndUpdate({ portal: 'upwork' }, { numberOfCrawledJobs: crawledJobsNumber })

    await axios.post(`http://bot:${process.env.BOT_DOCKER_PORT}/api`, { crawled: crawledJobsNumber })
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        console.error(error)
      })
  } catch (error) {
    console.log(error)
  }
}
